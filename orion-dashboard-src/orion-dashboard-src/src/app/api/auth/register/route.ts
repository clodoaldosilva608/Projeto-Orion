import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, setSessionCookie } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// No MVP: criação de conta é restrita a administradores.
// O primeiro admin é semeado pelo prisma/seed.ts (ADMIN_EMAIL/ADMIN_PASSWORD).
// Um admin logado pode criar novas contas de admin; clientes são criados pelo fluxo de cobrança.
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, password, name } = body
  if (!email || !password || !name) {
    return NextResponse.json({ error: 'Nome, e-mail e senha obrigatórios' }, { status: 400 })
  }

  const existing = await db.customer.findUnique({ where: { email: email.trim().toLowerCase() } })
  if (existing) {
    return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 409 })
  }

  const passwordHash = await hashPassword(password)
  const customer = await db.customer.create({
    data: {
      name,
      email: email.trim().toLowerCase(),
      role: 'admin',
      status: 'active',
      passwordHash,
    },
  })

  const user = { id: customer.id, email: customer.email, name: customer.name, role: 'admin' as const }
  const res = NextResponse.json({ ok: true, user }, { status: 201 })
  setSessionCookie(res, user)
  return res
}
