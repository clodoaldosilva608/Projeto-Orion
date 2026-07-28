import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession, type PlanSlug, PLANS } from '@/lib/stripe'
import { createSupabaseServerClient } from '@/lib/supabase'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * POST /api/stripe/create-checkout-session
 *
 * Body: { plan: 'starter' | 'pro' | 'enterprise', companyId?: string }
 *
 * Cria uma Checkout Session no Stripe com metadata { companyId, plan }.
 * O webhook /api/stripe/webhook ouve `checkout.session.completed` e ativa
 * a License + Company correspondente.
 *
 * Se companyId não for enviado, usa a empresa do usuário logado.
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const { plan, companyId } = body as { plan?: PlanSlug; companyId?: string }

  if (!plan || !PLANS[plan]) {
    return NextResponse.json({ error: 'Plano inválido. Use: starter, pro, enterprise' }, { status: 400 })
  }

  if (plan === 'free') {
    return NextResponse.json({ error: 'Plano free não require checkout' }, { status: 400 })
  }

  // Resolve company: priorize companyId do body, depois do DB pelo usuário logado
  let resolvedCompanyId = companyId
  if (!resolvedCompanyId) {
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      select: { companyId: true },
    })
    if (!dbUser) {
      return NextResponse.json({ error: 'Usuário não vinculado a nenhuma empresa' }, { status: 400 })
    }
    resolvedCompanyId = dbUser.companyId.toString()
  }

  // Verifica se a empresa existe
  const company = await prisma.company.findUnique({
    where: { id: BigInt(resolvedCompanyId) },
    select: { id: true, tradeName: true, email: true, stripeCustomerId: true },
  })
  if (!company) {
    return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
  }

  const result = await createCheckoutSession({
    plan,
    companyId: resolvedCompanyId,
    customerEmail: user.email!,
    customerId: company.stripeCustomerId ?? undefined,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success&plan=${plan}`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/planos?checkout=cancelled`,
  })

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ url: result.url })
}
