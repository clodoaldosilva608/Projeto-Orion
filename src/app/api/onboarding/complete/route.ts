import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * POST /api/onboarding/complete
 *
 * Salva dados do onboarding wizard e marca company.onboardingCompleted=true.
 * Body: { companyId, legalName, cnpj, phone, address, city, state,
 *         primaryColor, secondaryColor, appName, logoUrl }
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { id: true, companyId: true, isSuperAdmin: true },
  });
  if (!dbUser) return NextResponse.json({ error: "Usuário não vinculado" }, { status: 400 });

  const body = await request.json();
  const { companyId, ...data } = body;

  // Verifica se companyId do body bate com o do usuário logado
  if (companyId !== dbUser.companyId.toString()) {
    return NextResponse.json({ error: "Empresa não corresponde ao usuário" }, { status: 403 });
  }

  const updated = await prisma.company.update({
    where: { id: BigInt(companyId) },
    data: {
      legalName: data.legalName?.trim() || undefined,
      cnpj: data.cnpj?.trim() || null,
      phone: data.phone?.trim() || null,
      address: data.address?.trim() || null,
      city: data.city?.trim() || null,
      state: data.state?.trim() || null,
      primaryColor: data.primaryColor || undefined,
      secondaryColor: data.secondaryColor || undefined,
      appName: data.appName?.trim() || undefined,
      logoUrl: data.logoUrl || null,
      onboardingCompleted: true,
      onboardingStep: "completed",
    },
  });

  console.log(`[onboarding] ✓ Completed for company ${updated.id} (${updated.tradeName})`);

  return NextResponse.json({ success: true, company: { id: updated.id.toString() } });
}
