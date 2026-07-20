import { NextRequest, NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true })
  clearSessionCookie(res)
  return res
}
