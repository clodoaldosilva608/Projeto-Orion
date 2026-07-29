import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { prisma } from "@/lib/db";
import { getTenantUrl } from "@/lib/vercel";

export const dynamic = "force-dynamic";

/**
 * GET /api/sso/paguemenos-token
 *
 * Gera um JWT de SSO cross-app para o usuário logado acessar o PagueMenos.
 * O JWT contém { companyId (slug), userId, email, role, exp } assinado
 * com ORION_SSO_SECRET (compartilhado com o PagueMenos).
 *
 * Retorna: { url: "https://{subdomain}.projeto-paguemenos.vercel.app/api/sso?token=xxx" }
 *
 * O PagueMenos valida o JWT em /api/sso e faz login automático.
 */
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      companyId: true,
      isSuperAdmin: true,
      company: {
        select: {
          id: true,
          subdomain: true,
          tradeName: true,
          appName: true,
          active: true,
        },
      },
    },
  });

  if (!dbUser) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  if (!dbUser.company) return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
  if (!dbUser.company.active) return NextResponse.json({ error: "Empresa inativa" }, { status: 403 });

  const secret = process.env.ORION_SSO_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "SSO secret não configurado" }, { status: 500 });
  }

  // Gera JWT manualmente (sem biblioteca externa para evitar deps)
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: "orion-platform",
    sub: dbUser.id.toString(),
    email: dbUser.email,
    name: dbUser.name,
    company_id: dbUser.company.subdomain || "paguemenos", // slug como company_id
    company_name: dbUser.company.tradeName,
    role: dbUser.isSuperAdmin ? "admin" : "member",
    iat: now,
    exp: now + 60, // 60 segundos — token curto para SSO
  };

  const base64Url = (obj: any) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");

  const headerEncoded = base64Url(header);
  const payloadEncoded = base64Url(payload);

  // Assinatura HS256
  const crypto = await import("crypto");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${headerEncoded}.${payloadEncoded}`)
    .digest("base64url");

  const token = `${headerEncoded}.${payloadEncoded}.${signature}`;

  // URL do PagueMenos com token SSO
  const tenantUrl = getTenantUrl(dbUser.company.subdomain);
  const ssoUrl = `${tenantUrl}/api/sso?token=${token}`;

  console.log(`[sso] ✓ Token gerado para ${dbUser.email} → ${dbUser.company.subdomain}`);

  return NextResponse.json({
    url: ssoUrl,
    token, // exposto para debug (cliente abre via window.location)
    expiresIn: 60,
  });
}
