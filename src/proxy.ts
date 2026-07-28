import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16 proxy (formerly middleware).
 *
 * SaaS Multi-Tenant + Auth + 2FA:
 *
 * 1. TENANT ROUTING: Extracts subdomain from hostname and injects it as
 *    `x-tenant-subdomain` header. Server components read this to look up
 *    the Company (tenant) for white-label customization.
 *
 * 2. AUTH: Cookie-existence check — redirects unauthenticated users to
 *    /login when the Supabase auth cookie is missing.
 *
 * 3. 2FA: Redirects to /login/2fa when the 2FA-verified cookie is missing.
 *
 * 4. LICENSE CHECK: Done server-side in dashboard layout (not in proxy,
 *    because proxy runs on edge runtime and can't easily query Prisma).
 *
 * 5. SUPER ADMIN: /superadmin/* routes require isSuperAdmin (checked
 *    server-side, not in proxy — proxy just allows the route through).
 */

// Domains that are "platform" (not tenant-specific)
const PLATFORM_DOMAINS = ["localhost", "orion-saas-phi.vercel.app", "orion-platform-black.vercel.app", "orion-saas-platform.vercel.app"];

function extractSubdomain(hostname: string): string | null {
  const host = hostname.split(":")[0];

  if (PLATFORM_DOMAINS.some((d) => host === d || host.endsWith("." + d))) {
    for (const d of PLATFORM_DOMAINS) {
      if (host.endsWith("." + d)) {
        const sub = host.slice(0, -(d.length + 1));
        if (sub && sub !== "www") return sub;
      }
    }
    return null;
  }

  return null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.nextUrl.hostname;

  // === TENANT ROUTING ===
  const subdomain = extractSubdomain(hostname);
  const requestHeaders = new Headers(request.headers);
  if (subdomain) {
    requestHeaders.set("x-tenant-subdomain", subdomain);
  }
  requestHeaders.set("x-tenant-hostname", hostname);

  // Public routes that never require auth.
  const publicPaths = ["/", "/login", "/login/2fa", "/produtos", "/deployments", "/superadmin/login", "/kill-sw", "/clear-sw", "/planos"];
  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Stripe webhook — assinatura propria, não precisa de cookie
  if (pathname.startsWith("/api/stripe/webhook")) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Super Admin routes — allow through proxy (server-side checks isSuperAdmin)
  if (pathname.startsWith("/superadmin")) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }
  if (pathname.startsWith("/api/cron/")) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }
  if (pathname.startsWith("/api/v1/public/")) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }
  if (pathname.startsWith("/tv")) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }
  if (pathname.startsWith("/workspace")) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // === AUTH CHECK ===
  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => /^sb-[a-z0-9]+-auth-token$/i.test(c.name));

  if (!hasAuthCookie) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl, { headers: requestHeaders });
  }

  // === 2FA CHECK ===
  const twoFactorVerified = request.cookies.get("orion-2fa-verified")?.value === "1";
  if (!twoFactorVerified) {
    const url = request.nextUrl.clone();
    url.pathname = "/login/2fa";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url, { headers: requestHeaders });
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:css|js|map|woff|woff2|ttf|otf|eot|png|jpg|jpeg|gif|svg|ico|webp|avif)$).*)",
  ],
};
