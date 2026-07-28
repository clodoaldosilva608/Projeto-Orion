import { NextResponse } from "next/server";
import { getCurrentTenant, DEFAULT_TENANT } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export async function GET() {
  const tenant = await getCurrentTenant() ?? DEFAULT_TENANT;
  return NextResponse.json(tenant);
}
