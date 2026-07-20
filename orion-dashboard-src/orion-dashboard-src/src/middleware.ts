// =================================================================
// PROJETO ORION - Middleware de autenticação (Passo 1 - MVP)
// Protege todas as rotas /api/* e a área admin /, exceto:
//  - /login (página)
//  - /api/auth/* (login, logout, register)
//  - arquivos estáticos
// Usa `jose` (Edge-safe) para validar o JWT — jsonwebtoken não roda no Edge.
// =================================================================
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const COOKIE_NAME = 'orion_session'
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'orion-dev-secret-change-me'
)

async function isValidSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return false
  try {
    await jwtVerify(token, JWT_SECRET)
    return true
  } catch {
    return false
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Rotas de autenticação e estáticos ficam livres
  if (
    pathname.startsWith('/api/auth/') ||
    pathname === '/login' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  const authed = await isValidSession(req)

  // API sem sessão -> 401
  if (pathname.startsWith('/api/')) {
    if (!authed) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Página admin sem sessão -> login
  if (!authed) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
