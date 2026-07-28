import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')
  if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe não configurado' }, { status: 400 })
  }
  let event: any
  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' as any })
    event = stripe.webhooks.constructEvent(body, signature!, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const plan = session.metadata?.plan || 'free'
        const customerEmail = session.customer_details?.email || session.customer_email
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string
        const amountTotal = session.amount_total || 0
        if (customerEmail) {
          const user = await prisma.user.findFirst({ where: { email: { equals: customerEmail, mode: 'insensitive' } }, include: { company: true } })
          if (user?.company) {
            await prisma.company.update({ where: { id: user.company.id }, data: { plan: plan as any, licenseExpiresAt: new Date(Date.now() + 365*24*60*60*1000) } })
            await prisma.saasPayment.create({ data: { amountCents: amountTotal, currency: session.currency || 'brl', status: 'approved', method: 'credit_card', description: `Assinatura ${plan}`, clientId: user.company.id.toString() } }).catch(() => {})
            const existingLicense = await prisma.license.findFirst({ where: { companies: { some: { id: user.company.id } } } })
            if (existingLicense) {
              await prisma.license.update({ where: { id: existingLicense.id }, data: { plan: plan as any, status: 'active', active: true, startDate: new Date(), expirationDate: new Date(Date.now()+365*24*60*60*1000), metadata: { stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId } as any } })
            } else {
              await prisma.license.create({ data: { plan: plan as any, status: 'active', active: true, maxUsers: plan==='enterprise'?500:plan==='pro'?50:15, maxBranches: plan==='enterprise'?100:plan==='pro'?10:3, maxIndicators: 200, startDate: new Date(), expirationDate: new Date(Date.now()+365*24*60*60*1000), metadata: { stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId } as any, companies: { connect: { id: user.company.id } } } })
            }
            await prisma.saasActivity.create({ data: { type: 'payment_approved', title: 'Pagamento aprovado', description: `Assinatura ${plan} - R$ ${(amountTotal/100).toFixed(2)}`, userId: user.id.toString() } }).catch(() => {})
          }
        }
        break
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object
        const license = await prisma.license.findFirst({ where: { metadata: { path: ['stripeSubscriptionId'], equals: sub.id } }, include: { companies: true } })
        if (license?.companies[0]) {
          await prisma.license.update({ where: { id: license.id }, data: { status: (sub.status==='active'?'active':'suspended') as any, active: sub.status==='active' } })
        }
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object
        const license = await prisma.license.findFirst({ where: { metadata: { path: ['stripeSubscriptionId'], equals: sub.id } }, include: { companies: true } })
        if (license?.companies[0]) {
          await prisma.license.update({ where: { id: license.id }, data: { status: 'suspended', active: false } })
          await prisma.company.update({ where: { id: license.companies[0].id }, data: { active: false } })
        }
        break
      }
    }
    return NextResponse.json({ received: true })
  } catch (error: any) {
    return NextResponse.json({ received: true, error: error.message })
  }
}
