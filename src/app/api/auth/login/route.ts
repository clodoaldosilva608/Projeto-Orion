import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { AUTH_COOKIE_NAME } from "@/lib/supabase";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/dashboard");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "error",
      error?.message ?? "Credenciais inválidas.",
    );
    return NextResponse.redirect(loginUrl, 303);
  }

  const session = data.session;
  // Use 7 days for cookie maxAge — session.expires_in is typically 3600s (1h)
  // which would cause the cookie to expire too quickly and log users out.
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  const isProd = process.env.NODE_ENV === "production";

  // ---- 2FA check ----
  // If the user has 2FA enabled, set the auth cookie (so the 2FA page can
  // call the verify endpoint) and redirect to /login/2fa instead of the
  // dashboard. The 2FA verification step then sets `orion-2fa-verified=1`
  // and redirects to the original `redirectTo`.
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: data.user.id },
    select: { id: true, twoFactorEnabled: true, lastLoginAt: true },
  });

  const cookieValue = JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_in: session.expires_in,
    expires_at: session.expires_at,
    token_type: session.token_type,
    user: data.user,
  });

  if (dbUser?.twoFactorEnabled) {
    // Set the auth cookie but redirect to the 2FA step.
    const twoFactorUrl = new URL("/login/2fa", request.url);
    twoFactorUrl.searchParams.set("redirect", redirectTo);
    twoFactorUrl.searchParams.set("email", email);
    const res = NextResponse.redirect(twoFactorUrl, 303);
    res.cookies.set(AUTH_COOKIE_NAME, cookieValue, {
      path: "/",
      maxAge,
      sameSite: "lax",
      secure: isProd,
      httpOnly: false,
    });
    return res;
  }

  // ---- No 2FA: proceed as before ----
  await prisma.user.update({
    where: { id: dbUser?.id },
    data: { lastLoginAt: new Date() },
  }).catch(() => null);

  const dashboardUrl = new URL(redirectTo, request.url);
  const res = NextResponse.redirect(dashboardUrl, 303);

  res.cookies.set(AUTH_COOKIE_NAME, cookieValue, {
    path: "/",
    maxAge,
    sameSite: "lax",
    secure: isProd,
    httpOnly: false,
  });

  // Set 2FA-verified cookie so proxy.ts doesn't redirect.
  res.cookies.set("orion-2fa-verified", "1", {
    path: "/",
    maxAge,
    sameSite: "lax",
    secure: isProd,
    httpOnly: true,
  });

  return res;
}
