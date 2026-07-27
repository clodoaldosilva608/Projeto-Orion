import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16 proxy (formerly middleware).
 *
 * MINIMAL — only checks for auth cookie existence on page navigations.
 * Does NOT check 2FA (handled by login route).
 * Does NOT modify request headers or response cookies.
 * Does NOT run on RSC data requests (Next-Router fetches).
 */

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — no auth required
  const publicPaths = ["/", "/login", "/login/2fa", "/produtos", "/deployments", "/clear-sw"];
  if (publicPaths.some((p) => pathname === p)) {
    return NextResponse.next();
  }

  // Routes that bypass auth check entirely
  if (pathname.startsWith("/superadmin") ||
      pathname.startsWith("/api/auth/") ||
      pathname.startsWith("/api/cron/") ||
      pathname.startsWith("/api/v1/public/") ||
      pathname.startsWith("/tv") ||
      pathname.startsWith("/workspace")) {
    return NextResponse.next();
  }

  // Check for Supabase auth cookie (including chunked variants .0, .1, etc.)
  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => /^sb-[a-z0-9]+-auth-token(\.\d+)?$/i.test(c.name));

  if (!hasAuthCookie) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Auth cookie exists — allow through with ZERO modifications.
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude: static assets, SW, AND RSC data requests
    // RSC requests have header "RSC: 1" but we can't filter by header
    // in the matcher. Instead, we exclude common RSC patterns.
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:css|js|map|woff|woff2|ttf|otf|eot|png|jpg|jpeg|gif|svg|ico|webp|avif)$).*)",
  ],
};
