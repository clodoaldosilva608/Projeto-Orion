import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { AUTH_COOKIE_NAME } from "@/lib/supabase";
import { prisma } from "@/lib/db";
import { verifyTotpSync } from "@/lib/twoFactor";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/2fa/verify
 *
 * Body (JSON or form):
 *   - email
 *   - token (6-digit TOTP)
 *
 * If the user has 2FA enabled and the token matches, sets a short-lived
 * cookie `orion-2fa-verified=1` (10 minutes) and returns 200.
 * Otherwise returns 401.
 */
export async function POST(request: NextRequest) {
  let email = "";
  let token = "";

  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    email = String(body.email ?? "").trim();
    token = String(body.token ?? "").trim();
  } else {
    const fd = await request.formData();
    email = String(fd.get("email") ?? "").trim();
    token = String(fd.get("token") ?? "").trim();
  }

  if (!email || !token) {
    return NextResponse.json({ error: "E-mail e código são obrigatórios." }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(url, anonKey, { auth: { persistSession: false } });

  // Look up the DB user by email.
  const dbUser = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });
  if (!dbUser) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  if (!dbUser.twoFactorEnabled || !dbUser.twoFactorSecret) {
    return NextResponse.json({ error: "2FA não está ativo para este usuário." }, { status: 400 });
  }

  if (!verifyTotpSync(token, dbUser.twoFactorSecret)) {
    return NextResponse.json({ error: "Código TOTP inválido." }, { status: 401 });
  }

  // Re-validate password by checking that the auth cookie exists.
  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => /^sb-[a-z0-9]+-auth-token$/i.test(c.name));
  if (!hasAuthCookie) {
    return NextResponse.json({ error: "Sessão não encontrada. Faça login novamente." }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: dbUser.id },
    data: { lastLoginAt: new Date() },
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("orion-2fa-verified", "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
  return res;
}
