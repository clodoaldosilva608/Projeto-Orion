import { NextResponse } from "next/server";
import { getTenantBySubdomain, DEFAULT_TENANT } from "@/lib/tenant-db";

export const dynamic = "force-dynamic";

export async function GET() {
  const tenant = await getTenantBySubdomain(null) ?? DEFAULT_TENANT;
  return NextResponse.json(tenant);
}
