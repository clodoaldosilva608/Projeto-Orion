import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function doLogout(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  const res = NextResponse.redirect(loginUrl, 303);

  // Clear the Supabase auth cookie (and any chunked variants).
  res.cookies.set(AUTH_COOKIE_NAME, "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  // Also clear the 2FA verified cookie
  res.cookies.set("orion-2fa-verified", "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  return res;
}

export async function POST(request: NextRequest) {
  return doLogout(request);
}

// Also support GET for sidebar link compatibility
export async function GET(request: NextRequest) {
  return doLogout(request);
}
