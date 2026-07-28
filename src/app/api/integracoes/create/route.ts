import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await request.json();
  if (!body.name?.trim()) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });
  const erp = await prisma.erpIntegration.create({ data: { companyId: dbUser.companyId, erpType: body.erpType || "custom", name: body.name.trim(), apiUrl: body.apiUrl || null, apiKey: body.apiKey || null, status: "active" } });
  return NextResponse.json({ data: { id: erp.id.toString() } });
}
