import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { prisma } from "@/lib/db";
import { validateCnpj, sanitizeCnpj, slugifyCompany } from "@/lib/cnpj";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/register
 *
 * Self-signup público. Cria:
 *   1. Supabase Auth user (com email_verify automático)
 *   2. Company (tenant) com subdomain slugificado
 *   3. License trial de 14 dias (status=trial, trialEndsAt=+14d)
 *   4. User no Prisma (vinculado à Company, isSuperAdmin=false)
 *   5. Role "admin" se não existir
 *   6. EnabledModule para o produto escolhido (ex: paguemenos)
 *
 * Body JSON:
 *   { name, email, password, companyName, cnpj?, productSlug?, primaryColor?, secondaryColor? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, companyName, cnpj, productSlug, primaryColor, secondaryColor } = body;

    // === Validações básicas ===
    if (!name?.trim()) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });
    if (!email?.trim()) return NextResponse.json({ error: "Email obrigatório" }, { status: 400 });
    if (!password || password.length < 6) return NextResponse.json({ error: "Senha deve ter ao menos 6 caracteres" }, { status: 400 });
    if (!companyName?.trim()) return NextResponse.json({ error: "Nome da empresa obrigatório" }, { status: 400 });
    if (cnpj && !validateCnpj(cnpj)) return NextResponse.json({ error: "CNPJ inválido" }, { status: 400 });

    // === 1. Cria Supabase Auth user ===
    const supabase = await createSupabaseServerClient();
    // Usa admin API para criar e confirmar email em um step
    const supabaseAdmin = (await import("@supabase/supabase-js")).createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: true, // já confirmado
      user_metadata: { name, company_name: companyName, role: "admin" },
    });

    if (authError) {
      console.error("[register] Supabase auth error:", authError.message);
      if (authError.message.includes("already")) {
        return NextResponse.json({ error: "Email já cadastrado. Faça login." }, { status: 409 });
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const supabaseId = authData.user.id;

    // === 2. Cria Company (tenant) ===
    const subdomain = await generateUniqueSubdomain(slugifyCompany(companyName));

    const company = await prisma.company.create({
      data: {
        tradeName: companyName.trim(),
        legalName: companyName.trim(),
        subdomain,
        appName: companyName.trim(),
        email: email.toLowerCase().trim(),
        cnpj: cnpj ? sanitizeCnpj(cnpj) : null,
        primaryColor: primaryColor || "#8b5cf6",
        secondaryColor: secondaryColor || "#6366f1",
        backgroundColor: "#0f111a",
        plan: "free",
        active: true,
        country: "BR",
        onboardingCompleted: false,
        onboardingStep: "created",
      },
    });

    // === 3. Cria License trial de 14 dias ===
    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const license = await prisma.license.create({
      data: {
        plan: "free",
        status: "trial",
        active: true,
        maxUsers: 5,
        maxBranches: 1,
        maxIndicators: 10,
        startDate: new Date(),
        expirationDate: trialEndsAt,
        trialEndsAt,
        currency: "BRL",
        notes: `Trial de 14 dias — auto-criado no signup em ${new Date().toISOString()}`,
        metadata: { source: "self_signup", productSlug: productSlug || null, trialDays: 14 },
      },
    });

    // Linka licença na Company
    await prisma.company.update({
      where: { id: company.id },
      data: {
        licenseId: license.id,
        licenseExpiresAt: trialEndsAt,
        plan: "free",
        trialEndsAt,
      },
    });

    // === 4. Cria Branch Matriz ===
    const branch = await prisma.branch.create({
      data: { companyId: company.id, code: "MATRIZ", name: "Matriz", country: "BR", status: "active", isHeadquarters: true },
    });

    // === 5. Cria Role admin se não existir ===
    let adminRole = await prisma.role.findFirst({ where: { companyId: company.id, slug: "admin" } });
    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: { companyId: company.id, name: "Administrador", slug: "admin", description: "Acesso total", isSystem: true },
      });
    }

    // === 6. Cria User no Prisma ===
    const dbUser = await prisma.user.create({
      data: {
        companyId: company.id,
        branchId: branch.id,
        roleId: adminRole.id,
        supabaseId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        status: "active",
        emailVerifiedAt: new Date(),
        jobTitle: "Administrador",
        department: "Direção",
        isSuperAdmin: false,
        active: true,
      },
    });

    // === 7. Habilita módulo do produto escolhido ===
    if (productSlug) {
      // Mapeia slug → moduleKey
      const slugToModule: Record<string, string> = {
        "projeto-paguemenos": "paguemenos",
      };
      const moduleKey = slugToModule[productSlug];
      if (moduleKey) {
        await prisma.enabledModule.create({
          data: { companyId: company.id, moduleKey, enabled: true, grantedBy: dbUser.id },
        }).catch(() => {}); // ignora se já existe
      }
    }

    console.log(`[register] ✓ Conta criada: ${email} → Company ${company.id} (subdomain: ${subdomain})`);

    // Envia email de boas-vindas (não bloqueante)
    try {
      const { welcomeEmail, sendEmail } = await import("@/lib/emails");
      await sendEmail(welcomeEmail(
        { tradeName: company.tradeName, appName: company.appName, subdomain: company.subdomain },
        email.toLowerCase().trim(),
        name.trim(),
      ));
    } catch (emailErr: any) {
      console.warn("[register] Email de boas-vindas falhou:", emailErr.message);
    }

    return NextResponse.json({
      success: true,
      company: { id: company.id.toString(), subdomain: company.subdomain, tradeName: company.tradeName },
      license: { id: license.id.toString(), status: "trial", trialEndsAt: trialEndsAt.toISOString() },
      redirect: `/onboarding?company=${company.id}`,
    });
  } catch (error: any) {
    console.error("[register] Error:", error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}

/**
 * Gera subdomínio único — se já existe, adiciona sufixo numérico.
 */
async function generateUniqueSubdomain(base: string): Promise<string> {
  if (!base) base = "empresa";
  let candidate = base;
  let suffix = 1;
  while (await prisma.company.findFirst({ where: { subdomain: candidate } })) {
    candidate = `${base}-${suffix++}`;
  }
  return candidate;
}
