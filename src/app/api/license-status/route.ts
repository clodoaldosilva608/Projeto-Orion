import { NextResponse } from "next/server";
import { checkCompanyLicense } from "@/lib/modules-actions";

export const dynamic = "force-dynamic";

/**
 * GET /api/license-status
 *
 * Retorna o status atual da licença do usuário logado.
 * Usado pelo TrialBanner no dashboard.
 */
export async function GET() {
  const license = await checkCompanyLicense();
  return NextResponse.json({
    status: license.status ?? "no_license",
    daysLeft: license.daysLeft,
    active: license.active,
    reason: license.reason,
  });
}
