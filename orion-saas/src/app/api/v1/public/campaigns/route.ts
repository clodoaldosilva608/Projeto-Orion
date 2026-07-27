import { NextResponse, type NextRequest } from "next/server";
import { authenticateApiKeyAction } from "@/lib/plugins-actions";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/public/campaigns
 * Returns all campaigns for the authenticated company.
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  const { valid, companyId } = await authenticateApiKeyAction(token);
  if (!valid || !companyId) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const campaigns = await prisma.campaign.findMany({
    where: {
      companyId: BigInt(companyId),
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { participants: true, awards: true, goals: true } },
    },
  });

  return NextResponse.json({
    data: campaigns.map((c) => ({
      id: c.id.toString(),
      name: c.name,
      description: c.description,
      status: c.status,
      startDate: c.startDate.toISOString(),
      endDate: c.endDate.toISOString(),
      rules: c.rules,
      participantsCount: c._count.participants,
      awardsCount: c._count.awards,
      goalsCount: c._count.goals,
    })),
    count: campaigns.length,
  });
}
