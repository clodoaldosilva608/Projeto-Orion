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
  const publicPaths = ["/", "/login", "/login/2fa", "/produtos", "/deployments", "/clear-sw", "/kill-sw", "/robots.txt", "/sitemap.xml", "/favicon.svg", "/favicon.ico", "/manifest.json", "/sw.js"];
  if (publicPaths.some((p) => pathname === p)) {
    return NextResponse.next();
  }

  // Static assets — always public
  if (pathname.startsWith("/_next/") || pathname.startsWith("/public/")) {
    return NextResponse.next();
  }

  // Routes that bypass auth check entirely
  if (pathname.startsWith("/superadmin") ||
      pathname.startsWith("/api/auth/") ||
      pathname.startsWith("/api/cron/") ||
      pathname.startsWith("/api/v1/public/") ||
      pathname.startsWith("/api/fabrica/") ||
      pathname.startsWith("/api/ai/") ||
      pathname.startsWith("/api/backup/") ||
      pathname.startsWith("/tv") ||
      pathname.startsWith("/workspace") ||
      pathname.startsWith("/_next/")) {
    return NextResponse.next();
  }

  // If no auth cookie, redirect to login (not 404 — let the login page handle it)
  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => /^sb-[a-z0-9]+-auth-token(\.\d+)?$/i.test(c.name));

  if (!hasAuthCookie) {
    // For unknown routes WITHOUT auth, show 404 instead of redirecting to login
    // This fixes BUG 65: 404 should show error page, not redirect to login
    const knownRoutes = [
      "/dashboard", "/fabrica", "/metas", "/indicadores", "/resultados",
      "/aprovacoes", "/ranking", "/campanhas", "/gamificacao", "/calendario",
      "/checklist", "/feedback", "/plugins", "/usuarios", "/funcoes-permissoes",
      "/notificacoes", "/backups", "/configuracoes", "/logs-auditoria",
      "/clientes", "/licencas", "/pagamentos", "/assinaturas", "/planos",
      "/cupons", "/aplicacoes", "/file-projetos", "/builds", "/deploys",
      "/releases", "/anomalias", "/agentes-ia", "/jobs-ia", "/modelos",
      "/consumo-ia", "/provedores", "/chatbots", "/base-conhecimento",
      "/privacidade", "/superadmin",
    ];
    const isKnownRoute = knownRoutes.some(r => pathname === r || pathname.startsWith(r + "/"));
    
    if (!isKnownRoute) {
      // Unknown route — let Next.js show the 404 page
      return NextResponse.next();
    }
    
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
