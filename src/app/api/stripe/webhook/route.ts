import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Webhook Stripe — Orion SaaS Platform
 *
 * Eventos ouvidos:
 *   - checkout.session.completed  → ativa License + Company, salva stripeCustomerId
 *   - customer.subscription.updated → atualiza status da License
 *   - customer.subscription.deleted → marca License como canceled
 *   - invoice.payment_succeeded    → renew license expirationDate
 *
 * O webhook valida a assinatura com STRIPE_WEBHOOK_SECRET e só então processa.
 * Em caso de erro, retorna 500 para o Stripe tentar novamente.
 */
export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
    console.error('[stripe webhook] Stripe não configurado')
    return NextResponse.json({ error: 'Stripe não configurado' }, { status: 500 })
  }

  let event: any
  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' as any })

    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error: any) {
    console.error('[stripe webhook] Erro validando assinatura:', error.message)
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        console.log('[stripe webhook] checkout.session.completed:', session.id)

        const companyId = session.metadata?.companyId
        const plan = session.metadata?.plan

        if (!companyId) {
          console.error('[stripe webhook] metadata.companyId missing on session', session.id)
          break
        }

        // Salva stripeCustomerId na Company
        const stripeCustomerId = session.customer as string | undefined
        const stripeSubscriptionId = session.subscription as string | undefined

        // Mapeia plan → maxUsers / maxBranches
        const planConfig: Record<string, { maxUsers: number; maxBranches: number }> = {
          starter: { maxUsers: 20, maxBranches: 3 },
          pro: { maxUsers: 50, maxBranches: 10 },
          enterprise: { maxUsers: 100, maxBranches: 20 },
        }
        const cfg = planConfig[plan] ?? planConfig.starter

        // Cria ou atualiza a License
        const existingLicense = await prisma.license.findFirst({
          where: { companies: { some: { id: BigInt(companyId) } } },
        })

        const expirationDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)

        if (existingLicense) {
          await prisma.license.update({
            where: { id: existingLicense.id },
            data: {
              plan: (plan ?? 'pro') as any,
              status: 'active',
              active: true,
              maxUsers: cfg.maxUsers,
              maxBranches: cfg.maxBranches,
              expirationDate,
              trialEndsAt: null,
              metadata: {
                ...(existingLicense.metadata as any ?? {}),
                stripeCustomerId,
                stripeSubscriptionId,
                activatedAt: new Date().toISOString(),
              },
            },
          })
          console.log('[stripe webhook] License updated:', existingLicense.id)
        } else {
          const license = await prisma.license.create({
            data: {
              plan: (plan ?? 'pro') as any,
              status: 'active',
              active: true,
              maxUsers: cfg.maxUsers,
              maxBranches: cfg.maxBranches,
              maxIndicators: 50,
              startDate: new Date(),
              expirationDate,
              metadata: { stripeCustomerId, stripeSubscriptionId, activatedAt: new Date().toISOString() },
            },
          })
          await prisma.company.update({
            where: { id: BigInt(companyId) },
            data: { licenseId: license.id, licenseExpiresAt: expirationDate, plan: (plan ?? 'pro') as any },
          })
          console.log('[stripe webhook] License created:', license.id)
        }

        // Atualiza Company: stripeCustomerId + plan + active
        await prisma.company.update({
          where: { id: BigInt(companyId) },
          data: {
            stripeCustomerId: stripeCustomerId ?? null,
            licenseExpiresAt: expirationDate,
            plan: (plan ?? 'pro') as any,
            active: true,
          },
        })
        console.log('[stripe webhook] Company updated:', companyId)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        console.log('[stripe webhook] customer.subscription.updated:', subscription.id)

        const customerId = subscription.customer as string
        const status = subscription.status as string // active, past_due, canceled, etc.

        // Encontra a empresa pelo stripeCustomerId
        const company = await prisma.company.findFirst({
          where: { stripeCustomerId: customerId },
          include: { license: true },
        })

        if (!company) {
          console.warn('[stripe webhook] No company found for customer:', customerId)
          break
        }

        // Mapeia status Stripe → LicenseStatus
        const statusMap: Record<string, string> = {
          active: 'active',
          trialing: 'trial',
          past_due: 'suspended',
          canceled: 'canceled',
          unpaid: 'suspended',
          incomplete: 'suspended',
          incomplete_expired: 'canceled',
        }
        const licenseStatus = (statusMap[status] ?? 'suspended') as any

        if (company.license) {
          await prisma.license.update({
            where: { id: company.license.id },
            data: { status: licenseStatus, active: status === 'active' },
          })
        }

        // Suspende a empresa se a assinatura não estiver ativa
        if (status !== 'active' && status !== 'trialing') {
          await prisma.company.update({
            where: { id: company.id },
            data: { active: false },
          })
        } else {
          await prisma.company.update({
            where: { id: company.id },
            data: { active: true },
          })
        }
        console.log('[stripe webhook] Subscription updated for company:', company.id, 'status:', licenseStatus)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        console.log('[stripe webhook] customer.subscription.deleted:', subscription.id)

        const customerId = subscription.customer as string
        const company = await prisma.company.findFirst({
          where: { stripeCustomerId: customerId },
          include: { license: true },
        })

        if (!company) break

        if (company.license) {
          await prisma.license.update({
            where: { id: company.license.id },
            data: { status: 'canceled', active: false },
          })
        }
        await prisma.company.update({
          where: { id: company.id },
          data: { active: false, plan: 'free' as any },
        })
        console.log('[stripe webhook] Subscription canceled for company:', company.id)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        console.log('[stripe webhook] invoice.payment_succeeded:', invoice.id)

        // Renova a licença por mais 1 mês/ano dependendo do intervalo
        const customerId = invoice.customer as string
        const company = await prisma.company.findFirst({
          where: { stripeCustomerId: customerId },
          include: { license: true },
        })
        if (!company || !company.license) break

        // Estende expirationDate baseado no período da invoice
        const periodEnd = invoice.lines?.data?.[0]?.period?.end
          ? new Date(invoice.lines.data[0].period.end * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

        await prisma.license.update({
          where: { id: company.license.id },
          data: {
            status: 'active',
            active: true,
            expirationDate: periodEnd,
          },
        })
        await prisma.company.update({
          where: { id: company.id },
          data: { licenseExpiresAt: periodEnd, active: true },
        })
        console.log('[stripe webhook] License renewed for company:', company.id, 'until:', periodEnd)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        console.log('[stripe webhook] invoice.payment_failed:', invoice.id)

        const customerId = invoice.customer as string
        const company = await prisma.company.findFirst({
          where: { stripeCustomerId: customerId },
          include: { license: true },
        })
        if (!company || !company.license) break

        // Marca como suspended mas não cancela (damos um período de carência)
        await prisma.license.update({
          where: { id: company.license.id },
          data: { status: 'suspended' },
        })
        break
      }

      default:
        // Eventos não tratados — loga apenas
        console.log('[stripe webhook] Unhandled event:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('[stripe webhook] Erro processando evento:', error)
    return NextResponse.json(
      { error: 'Internal server error', detail: error.message },
      { status: 500 }
    )
  }
}
