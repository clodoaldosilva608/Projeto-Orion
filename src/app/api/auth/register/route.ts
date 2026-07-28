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

    // CNPJ é OPCIONAL — só valida se o usuário digitou os 14 dígitos completos.
    // Se digitou parcialmente (ex: "12.345"), ignora silenciosamente (trata como vazio).
    const sanitizedCnpj = cnpj ? sanitizeCnpj(cnpj) : "";
    const finalCnpj = sanitizedCnpj.length === 14 ? (validateCnpj(sanitizedCnpj) ? sanitizedCnpj : null) : null;
    if (cnpj && sanitizedCnpj.length === 14 && !validateCnpj(sanitizedCnpj)) {
      return NextResponse.json({ error: "CNPJ inválido — verifique os dígitos" }, { status: 400 });
    }

    // === 1. Cria Supabase Auth user ===
    // Estratégia: tentar admin.createUser PRIMEIRO (não envia email, sem rate limit)
    // Se a service_role key estiver inválida, cair para signUp (envia email, sujeito a rate limit)
    const supabase = await createSupabaseServerClient();
    const { createClient } = await import("@supabase/supabase-js");

    let supabaseId: string | null = null;
    let authMethod: "admin" | "signup" | null = null;

    // TENTATIVA 1: admin.createUser (preferencial — não tem rate limit de email)
    if (process.env.SUPABASE_SECRET_KEY) {
      try {
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SECRET_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } }
        );
        const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
          email: email.toLowerCase().trim(),
          password,
          email_confirm: true, // já confirmado — não envia email
          user_metadata: { name, company_name: companyName, role: "admin" },
        });
        if (!adminError && adminData.user) {
          supabaseId = adminData.user.id;
          authMethod = "admin";
          console.log("[register] ✓ User criado via admin.createUser (sem email)");
        } else if (adminError) {
          console.warn("[register] admin.createUser falhou:", adminError.message, "- tentando signUp");
        }
      } catch (adminErr: any) {
        console.warn("[register] admin API exception:", adminErr.message, "- tentando signUp");
      }
    }

    // TENTATIVA 2: signUp (fallback — envia email, sujeito a rate limit)
    if (!supabaseId) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: { name, company_name: companyName, role: "admin" },
        },
      });

      if (signUpError) {
        console.error("[register] signUp error:", signUpError.message);
        if (signUpError.message.includes("already")) {
          return NextResponse.json({ error: "Email já cadastrado. Faça login." }, { status: 409 });
        }
        if (signUpError.message.includes("rate limit") || signUpError.message.includes("over_email_send_rate_limit")) {
          return NextResponse.json({
            error: "Muitas tentativas de cadastro nas últimas horas. Aguarde alguns minutos e tente novamente, ou entre em contato com o suporte.",
          }, { status: 429 });
        }
        return NextResponse.json({ error: signUpError.message }, { status: 400 });
      }

      if (!signUpData.user) {
        return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 });
      }

      supabaseId = signUpData.user.id;
      authMethod = "signup";
      console.log("[register] ✓ User criado via signUp (com email de confirmação)");
    }

    if (!supabaseId) {
      return NextResponse.json({ error: "Falha ao criar usuário" }, { status: 500 });
    }

    // Se foi via signUp, tenta confirmar email automaticamente via admin API
    if (authMethod === "signup" && process.env.SUPABASE_SECRET_KEY) {
      try {
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SECRET_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } }
        );
        await supabaseAdmin.auth.admin.updateUserById(supabaseId, { email_confirm: true });
        console.log("[register] ✓ Email confirmado automaticamente via admin API");
      } catch (confirmErr: any) {
        console.warn("[register] Confirmação automática falhou:", confirmErr.message);
      }
    }

    // === 2. Cria Company (tenant) ===
    const subdomain = await generateUniqueSubdomain(slugifyCompany(companyName));

    const company = await prisma.company.create({
      data: {
        tradeName: companyName.trim(),
        legalName: companyName.trim(),
        subdomain,
        appName: companyName.trim(),
        email: email.toLowerCase().trim(),
        cnpj: finalCnpj,
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
