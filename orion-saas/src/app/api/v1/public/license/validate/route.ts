import { NextResponse, type NextRequest } from "next/server";
import { validateLicenseAction } from "@/lib/license-actions";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/public/license/validate
 *
 * Body: { "licenseKey": "ORION-XXXX-XXXX-XXXX-XXXX" }
 *
 * Validates a software license. Returns:
 *   {
 *     "valid": true/false,
 *     "reason": "Licença válida",
 *     "status": "active",
 *     "clientName": "João Silva",
 *     "plan": "standard",
 *     "expiresAt": "2027-07-27T..."
 *   }
 *
 * This endpoint is public (no auth required) — it's meant to be called
 * by the delivered software to validate its license online.
 */
export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body.licenseKey) {
    return NextResponse.json({ error: "licenseKey é obrigatório" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "0.0.0.0";
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  const { data, error } = await validateLicenseAction(body.licenseKey, {
    ipAddress: ip,
    userAgent,
  });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * GET /api/v1/public/license/validate?key=ORION-XXXX-XXXX-XXXX-XXXX
 *
 * Same as POST but via query param (for simpler integration).
 */
export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  if (!key) {
    return NextResponse.json({ error: "key query param is required" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "0.0.0.0";
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  const { data, error } = await validateLicenseAction(key, {
    ipAddress: ip,
    userAgent,
  });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data);
}
