import { NextResponse, type NextRequest } from "next/server";
import { authenticateApiKeyAction } from "@/lib/plugins-actions";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/public/goals
 *
 * Returns all goals for the authenticated company.
 * Requires: Bearer orion_live_xxx
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  const { valid, companyId } = await authenticateApiKeyAction(token);
  if (!valid || !companyId) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 200);
  const status = url.searchParams.get("status");

  const goals = await prisma.goal.findMany({
    where: {
      companyId: BigInt(companyId),
      active: true,
      deletedAt: null,
      ...(status ? { type: status as any } : {}),
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { indicator: true },
  });

  return NextResponse.json({
    data: goals.map((g) => ({
      id: g.id.toString(),
      name: g.name,
      description: g.description,
      type: g.type,
      targetValue: Number(g.targetValue),
      startDate: g.startDate.toISOString(),
      endDate: g.endDate.toISOString(),
      indicator: g.indicator?.name ?? null,
      active: g.active,
    })),
    count: goals.length,
  });
}
