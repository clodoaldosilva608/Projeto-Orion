import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession, type PlanSlug } from '@/lib/stripe'
import { createSupabaseServerClient } from '@/lib/supabase'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * POST /api/stripe/checkout
 * Legacy route — kept for backward compatibility.
 * Novo código deve usar /api/stripe/create-checkout-session.
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const { plan } = body as { plan?: PlanSlug }

  if (!plan) return NextResponse.json({ error: 'Plano obrigatório' }, { status: 400 })

  // Resolve companyId from logged-in user
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { companyId: true, company: { select: { stripeCustomerId: true } } },
  })
  if (!dbUser) {
    return NextResponse.json({ error: 'Usuário não vinculado a empresa' }, { status: 400 })
  }

  const result = await createCheckoutSession({
    plan,
    companyId: dbUser.companyId.toString(),
    customerEmail: user.email!,
    customerId: dbUser.company.stripeCustomerId ?? undefined,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success&plan=${plan}`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/planos?checkout=cancelled`,
  })

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ url: result.url })
}
