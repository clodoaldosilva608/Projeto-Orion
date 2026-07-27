import { NextResponse, type NextRequest } from "next/server";
import { authenticateApiKeyAction } from "@/lib/plugins-actions";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/public/users
 * Returns users of the authenticated company (no PII like CPF).
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  const { valid, companyId } = await authenticateApiKeyAction(token);
  if (!valid || !companyId) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { companyId: BigInt(companyId), active: true, deletedAt: null },
    select: {
      id: true, name: true, email: true, jobTitle: true, department: true,
      status: true, createdAt: true, lastLoginAt: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    data: users.map((u) => ({
      id: u.id.toString(),
      name: u.name,
      email: u.email,
      jobTitle: u.jobTitle,
      department: u.department,
      status: u.status,
      createdAt: u.createdAt.toISOString(),
      lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
    })),
    count: users.length,
  });
}
