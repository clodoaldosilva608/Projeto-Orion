import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase";
export const dynamic = "force-dynamic";
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const integrations = await prisma.erpIntegration.findMany({ where: { companyId: dbUser.companyId }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ data: integrations.map(i => ({ ...i, id: i.id.toString(), companyId: i.companyId.toString(), lastSyncAt: i.lastSyncAt?.toISOString() ?? null })) });
}
