import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16 proxy (formerly middleware).
 *
 * MINIMAL version — only checks for auth cookie existence.
 * 
 * No header modification, no cookie setting, no 2FA check.
 * The 2FA flow is handled by the login route (redirects to /login/2fa
 * if user has 2FA enabled). The proxy should NOT check 2FA because
 * that creates a dependency on a second cookie that can be lost.
 */

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — no auth required
  const publicPaths = ["/", "/login", "/login/2fa", "/produtos", "/deployments"];
  if (publicPaths.some((p) => pathname === p)) {
    return NextResponse.next();
  }

  // Routes that bypass auth check
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

  // Auth cookie exists — allow request through.
  // CRITICAL: use PLAIN NextResponse.next() with NO modifications.
  // Any modification (headers, cookies) breaks cookie forwarding in Next.js 16.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:css|js|map|woff|woff2|ttf|otf|eot|png|jpg|jpeg|gif|svg|ico|webp|avif)$).*)",
  ],
};
