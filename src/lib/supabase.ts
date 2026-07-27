import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieTuple = { name: string; value: string; options?: Record<string, unknown> };

export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieTuple[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as never),
          );
        } catch {
          // Called from a Server Component — safe to ignore when proxy refreshes.
        }
      },
    },
  });
}

export const SUPABASE_PROJECT_REF = "iwadvrvdlpdjiclwvsgw";
export const AUTH_COOKIE_NAME = `sb-${SUPABASE_PROJECT_REF}-auth-token`;
