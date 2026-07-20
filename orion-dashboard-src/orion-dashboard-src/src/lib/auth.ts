// =================================================================
// PROJETO ORION - Auth (Passo 1 - MVP)
// Sessão baseada em JWT em cookie httpOnly (stateless, sem dependências externas)
// Credenciais hasheadas com bcryptjs (já instalado no projeto)
// =================================================================
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const COOKIE_NAME = 'orion_session'
const JWT_SECRET = process.env.JWT_SECRET || 'orion-dev-secret-change-me'
const TOKEN_TTL = '7d' // admin loga uma vez por semana

export type SessionUser = {
  id: string
  email: string
  name: string
  role: 'admin' | 'customer'
}

// ---------- Hash de senha ----------
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10)
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

// ---------- JWT ----------
function signToken(user: SessionUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: TOKEN_TTL })
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser
  } catch {
    return null
  }
}

// ---------- Cookies ----------
export function setSessionCookie(res: NextResponse, user: SessionUser) {
  const token = signToken(user)
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  })
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(COOKIE_NAME, '', { httpOnly: true, path: '/', maxAge: 0 })
}

// ---------- Leitura de sessão ----------
export function getUserFromRequest(req: NextRequest): SessionUser | null {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

// ---------- Helpers de proteção ----------
// Para Route Handlers (API): retorna o user ou uma NextResponse 401
export async function requireAuth(req: NextRequest): Promise<SessionUser | NextResponse> {
  const user = getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }
  return user
}

// Para Server Components (páginas): redireciona para /login se não logado
export function redirectIfUnauthenticated(req: NextRequest): SessionUser | null {
  const user = getUserFromRequest(req)
  return user
}

// ---------- Login ----------
export async function authenticate(email: string, password: string): Promise<SessionUser | null> {
  const customer = await db.customer.findUnique({ where: { email } })
  if (!customer || !customer.passwordHash) return null
  if (customer.status !== 'active') return null
  const ok = await verifyPassword(password, customer.passwordHash)
  if (!ok) return null
  return {
    id: customer.id,
    email: customer.email,
    name: customer.name,
    role: customer.role === 'admin' ? 'admin' : 'customer',
  }
}
