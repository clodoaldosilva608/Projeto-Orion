import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16 proxy (formerly middleware).
 *
 * Lightweight cookie-existence check only — ZERO Supabase API calls.
 * Protects authenticated routes by redirecting unauthenticated users to
 * /login when the Supabase auth cookie is missing, and redirects to
 * /login/2fa when the 2FA-verified cookie is missing (only if the user
 * has 2FA enabled — we can't tell here, so we rely on the login route to
 * send users to /login/2fa when 2FA is on; the verified cookie is set
 * for non-2FA users too).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that never require auth.
  const publicPaths = ["/", "/login", "/login/2fa", "/produtos", "/deployments"];
  if (publicPaths.some((p) => pathname === p)) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/cron/")) {
    return NextResponse.next();
  }
  // Public REST API — auth via Bearer token (API key), not cookie
  if (pathname.startsWith("/api/v1/public/")) {
    return NextResponse.next();
  }
  // TV dashboard — accessible via auth cookie OR ?key=<tv_token> query param
  // The page itself validates the token server-side; we just allow the route
  // through proxy so the TV can be configured in kiosk mode.
  if (pathname.startsWith("/tv")) {
    return NextResponse.next();
  }

  // Look for any cookie matching sb-*-auth-token.
  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => /^sb-[a-z0-9]+-auth-token$/i.test(c.name));

  if (!hasAuthCookie) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2FA: if the user has an auth cookie but no 2FA-verified cookie, send
  // them to /login/2fa. (The login route sets `orion-2fa-verified=1`
  // immediately for users without 2FA, so this only catches users with
  // 2FA enabled who haven't completed the second factor.)
  const twoFactorVerified = request.cookies.get("orion-2fa-verified")?.value === "1";
  if (!twoFactorVerified) {
    const url = request.nextUrl.clone();
    url.pathname = "/login/2fa";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on everything except static assets and Next internals.
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:css|js|map|woff|woff2|ttf|otf|eot|png|jpg|jpeg|gif|svg|ico|webp|avif)$).*)",
  ],
};
