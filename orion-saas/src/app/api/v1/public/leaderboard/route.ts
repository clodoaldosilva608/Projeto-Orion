import { NextResponse, type NextRequest } from "next/server";
import { authenticateApiKeyAction } from "@/lib/plugins-actions";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/public/leaderboard
 * Returns the points leaderboard for the authenticated company.
 * Query params: period=month|all (default month)
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  const { valid, companyId } = await authenticateApiKeyAction(token);
  if (!valid || !companyId) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const url = new URL(request.url);
  const period = url.searchParams.get("period") ?? "month";
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 200);

  const where: any = { companyId: BigInt(companyId) };
  if (period === "month") {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    where.createdAt = { gte: monthStart };
  }

  const rows = await prisma.pointTransaction.groupBy({
    by: ["userId"],
    where,
    _sum: { points: true },
    orderBy: { _sum: { points: "desc" } },
    take: limit,
  });

  if (rows.length === 0) {
    return NextResponse.json({ data: [], count: 0 });
  }

  const users = await prisma.user.findMany({
    where: { id: { in: rows.map((r) => r.userId) } },
    select: { id: true, name: true, email: true, jobTitle: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  return NextResponse.json({
    data: rows.map((r, idx) => {
      const u = userMap.get(r.userId);
      return {
        position: idx + 1,
        userId: r.userId.toString(),
        name: u?.name ?? "—",
        email: u?.email ?? "",
        jobTitle: u?.jobTitle ?? null,
        points: r._sum.points ?? 0,
      };
    }),
    count: rows.length,
    period,
  });
}
