import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16 proxy (formerly middleware).
 *
 * SaaS Multi-Tenant + Auth + 2FA.
 *
 * IMPORTANT: We do NOT use `NextResponse.next({ request: { headers } })`
 * because that pattern breaks cookie forwarding in Next.js 16 — the
 * modified response object doesn't carry Set-Cookie headers from
 * downstream handlers, causing the session to be lost on every navigation.
 *
 * Instead, we set tenant info in a COOKIE (not a request header), which
 * is safe and doesn't interfere with session cookies.
 */

// Domains that are "platform" (not tenant-specific)
const PLATFORM_DOMAINS = ["localhost", "orion-saas-phi.vercel.app", "orion-platform-black.vercel.app"];

function extractSubdomain(hostname: string): string | null {
  const host = hostname.split(":")[0];
  for (const d of PLATFORM_DOMAINS) {
    if (host === d) return null; // No subdomain — default tenant
    if (host.endsWith("." + d)) {
      const sub = host.slice(0, -(d.length + 1));
      if (sub && sub !== "www") return sub;
    }
  }
  return null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.nextUrl.hostname;

  // === TENANT ROUTING ===
  // Set tenant subdomain in a response cookie (NOT request headers —
  // modifying request headers breaks cookie forwarding in Next.js 16).
  const subdomain = extractSubdomain(hostname);

  // Helper: create a response that preserves tenant info via cookie
  function tenantResponse(response: NextResponse) {
    if (subdomain) {
      response.cookies.set("x-tenant-subdomain", subdomain, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
        sameSite: "lax",
        httpOnly: true,
      });
    }
    return response;
  }

  // Public routes that never require auth.
  const publicPaths = ["/", "/login", "/login/2fa", "/produtos", "/deployments", "/superadmin/login"];
  if (publicPaths.some((p) => pathname === p)) {
    return tenantResponse(NextResponse.next());
  }

  // Super Admin routes — allow through proxy (server-side checks isSuperAdmin)
  if (pathname.startsWith("/superadmin")) {
    return tenantResponse(NextResponse.next());
  }

  if (pathname.startsWith("/api/auth/")) {
    return tenantResponse(NextResponse.next());
  }
  if (pathname.startsWith("/api/cron/")) {
    return tenantResponse(NextResponse.next());
  }
  if (pathname.startsWith("/api/v1/public/")) {
    return tenantResponse(NextResponse.next());
  }
  if (pathname.startsWith("/tv")) {
    return tenantResponse(NextResponse.next());
  }
  if (pathname.startsWith("/workspace")) {
    return tenantResponse(NextResponse.next());
  }

  // === AUTH CHECK ===
  // Look for any cookie matching sb-*-auth-token (including chunked variants .0, .1, etc.)
  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => /^sb-[a-z0-9]+-auth-token(\.\d+)?$/i.test(c.name));

  if (!hasAuthCookie) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return tenantResponse(NextResponse.redirect(loginUrl));
  }

  // === 2FA CHECK ===
  const twoFactorVerified = request.cookies.get("orion-2fa-verified")?.value === "1";
  if (!twoFactorVerified) {
    const url = request.nextUrl.clone();
    url.pathname = "/login/2fa";
    url.searchParams.set("redirect", pathname);
    return tenantResponse(NextResponse.redirect(url));
  }

  // All checks passed — allow the request through.
  // CRITICAL: use plain NextResponse.next() WITHOUT modifying request headers.
  // Modifying request headers ({ request: { headers } }) breaks cookie
  // forwarding and causes the session to be lost on every page navigation.
  return tenantResponse(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:css|js|map|woff|woff2|ttf|otf|eot|png|jpg|jpeg|gif|svg|ico|webp|avif)$).*)",
  ],
};
