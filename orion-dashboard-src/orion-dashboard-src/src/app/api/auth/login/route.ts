import { NextRequest, NextResponse } from 'next/server'
import { authenticate, setSessionCookie } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: 'E-mail e senha obrigatórios' }, { status: 400 })
  }
  const user = await authenticate(email.trim().toLowerCase(), password)
  if (!user) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true, user })
  setSessionCookie(res, user)
  return res
}
