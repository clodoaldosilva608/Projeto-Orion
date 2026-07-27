import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /clear-sw
 *
 * Clears all browser storage (cache, cookies, service workers) and
 * redirects to /login. This is a nuclear option to fix the stuck
 * Service Worker issue.
 */
export async function GET() {
  const res = NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "https://orion-saas-platform.vercel.app"), 303);

  // Clear EVERYTHING — cache, cookies, storage, execution contexts
  res.headers.set("Clear-Site-Data", '"cache", "cookies", "storage", "executionContexts"');

  // Also clear the auth cookies explicitly
  res.cookies.set("sb-iwadvrvdlpdjiclwvsgw-auth-token", "", { path: "/", maxAge: 0 });
  res.cookies.set("orion-2fa-verified", "", { path: "/", maxAge: 0 });

  return res;
}
