import { NextRequest, NextResponse } from 'next/server'
import { createBillingPortal } from '@/lib/stripe'
import { createSupabaseServerClient } from '@/lib/supabase'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * POST /api/stripe/portal
 *
 * Cria sessão do Stripe Customer Portal para o usuário gerenciar sua assinatura
 * (cancelar, trocar plano, atualizar cartão, ver faturas).
 *
 * Body vazio ou { companyId?: string }
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const { companyId } = body as { companyId?: string }

  // Resolve company
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

  const company = await prisma.company.findUnique({
    where: { id: BigInt(resolvedCompanyId) },
    select: { id: true, tradeName: true, stripeCustomerId: true },
  })
  if (!company) {
    return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
  }

  if (!company.stripeCustomerId) {
    return NextResponse.json({
      error: 'Empresa ainda não possui assinatura ativa no Stripe. Faça checkout primeiro.',
    }, { status: 400 })
  }

  const result = await createBillingPortal({
    customerId: company.stripeCustomerId,
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  })

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ url: result.url })
}
