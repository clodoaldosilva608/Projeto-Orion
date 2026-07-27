import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession, type PlanSlug } from '@/lib/stripe'
import { createSupabaseServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { plan } = await request.json()
  if (!plan) return NextResponse.json({ error: 'Plano obrigatório' }, { status: 400 })

  const result = await createCheckoutSession({
    plan: plan as PlanSlug,
    customerEmail: user.email!,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/planos?checkout=cancelled`,
  })

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ url: result.url })
}
