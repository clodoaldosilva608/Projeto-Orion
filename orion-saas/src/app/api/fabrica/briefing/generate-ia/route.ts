import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { prisma } from "@/lib/db";
import { generateIaBriefingAction } from "@/lib/fabrica-actions";

export const dynamic = "force-dynamic";

/**
 * POST /api/fabrica/briefing/generate-ia
 *
 * Body: { briefingId: string }
 *
 * Triggers IA generation for a briefing. Returns 200 with status, or 401
 * if not authenticated.
 *
 * This endpoint is useful for polling — the client can POST once and then
 * GET /api/fabrica/briefing/[id]/status to check progress.
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body.briefingId) {
    return NextResponse.json({ error: "briefingId é obrigatório" }, { status: 400 });
  }

  // Verify briefing belongs to user's company
  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const briefing = await prisma.projectBriefing.findFirst({
    where: { id: BigInt(body.briefingId), companyId: dbUser.companyId },
    select: { id: true, status: true },
  });
  if (!briefing) {
    return NextResponse.json({ error: "Briefing não encontrado" }, { status: 404 });
  }

  // Trigger IA generation (async, non-blocking)
  generateIaBriefingAction(body.briefingId).catch((e) => {
    console.error("[/api/fabrica/briefing/generate-ia] error:", e);
  });

  return NextResponse.json({
    ok: true,
    message: "Geração de IA iniciada. O briefing será atualizado em segundos.",
    briefingId: body.briefingId,
  });
}
