import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/backup/download?id=<backupId>
 *
 * Streams the backup as a JSON file. The backup row stores only metadata;
 * we re-generate the JSON export on-demand from the current DB state
 * (since these are small datasets — for large backups we'd persist the file).
 *
 * Auth: requires a logged-in user that belongs to the same company as the
 * backup row.
 */
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const backupId = BigInt(id);
  const backup = await prisma.backup.findFirst({
    where: { id: backupId, companyId: dbUser.companyId },
  });
  if (!backup) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Re-export (matches the data shape from createBackupAction).
  const [goals, indicators, results, users, payments, auditLogs] = await Promise.all([
    prisma.goal.findMany({ where: { companyId: dbUser.companyId } }),
    prisma.indicator.findMany({ where: { companyId: dbUser.companyId } }),
    prisma.result.findMany({ where: { companyId: dbUser.companyId } }),
    prisma.user.findMany({ where: { companyId: dbUser.companyId }, select: { id: true, name: true, email: true, status: true, createdAt: true } }),
    prisma.saasPayment.findMany({ include: { client: true }, take: 1000 }),
    prisma.auditLog.findMany({ where: { companyId: dbUser.companyId }, take: 1000, orderBy: { createdAt: "desc" } }),
  ]);

  const exportData = {
    backupId: backup.id.toString(),
    backupType: backup.type,
    exportedAt: new Date().toISOString(),
    companyId: dbUser.companyId.toString(),
    counts: {
      goals: goals.length,
      indicators: indicators.length,
      results: results.length,
      users: users.length,
      payments: payments.length,
      auditLogs: auditLogs.length,
    },
    goals,
    indicators,
    results,
    users,
    payments,
    auditLogs,
  };

  const json = JSON.stringify(
    exportData,
    (_key, value) => (typeof value === "bigint" ? value.toString() : value),
    2,
  );

  return new NextResponse(json, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="orion-backup-${backup.id.toString()}.json"`,
    },
  });
}
