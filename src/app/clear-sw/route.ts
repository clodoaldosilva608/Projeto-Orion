import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /clear-sw
 *
 * Clears Service Worker caches and storage, then redirects to /login.
 * Does NOT clear cookies (that would log out the user before they
 * can re-login).
 */
export async function GET(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  const res = NextResponse.redirect(loginUrl, 303);

  // Clear caches and storage (SW, localStorage, cache storage)
  // Do NOT clear cookies — the user might still be logged in
  res.headers.set("Clear-Site-Data", '"cache", "storage"');

  return res;
}
