import { NextResponse, type NextRequest } from "next/server";
import { authenticateApiKeyAction } from "@/lib/plugins-actions";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/public/results
 * Returns approved results for the authenticated company.
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
  const status = url.searchParams.get("status") ?? "approved";

  const results = await prisma.result.findMany({
    where: {
      companyId: BigInt(companyId),
      status: status as any,
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      goal: { select: { name: true } },
      user: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json({
    data: results.map((r) => ({
      id: r.id.toString(),
      value: Number(r.value),
      status: r.status,
      referenceDate: r.referenceDate.toISOString(),
      approvedAt: r.approvedAt?.toISOString() ?? null,
      goal: r.goal?.name ?? null,
      user: r.user?.name ?? null,
      userEmail: r.user?.email ?? null,
    })),
    count: results.length,
  });
}
