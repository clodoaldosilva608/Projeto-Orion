import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/me
 *
 * Returns the current user's basic profile + 2FA status. Used by the
 * configuracoes page to render the 2FA setup/disable UI.
 */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      twoFactorEnabled: true,
      lastLoginAt: true,
      status: true,
    },
  });
  if (!dbUser) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    ...dbUser,
    id: dbUser.id.toString(),
    lastLoginAt: dbUser.lastLoginAt?.toISOString() ?? null,
  });
}
