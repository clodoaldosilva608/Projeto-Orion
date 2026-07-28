/**
 * Orion SaaS Platform — Seed Script
 *
 * Garante que o banco tenha:
 *   1. A empresa PagueMenos como tenant principal (id=1) com subdomain,
 *      cores da marca, appName e licença "Paid Forever" (10 anos).
 *   2. O usuário clodoaldosilva608@gmail.com como Super Admin.
 *   3. Módulos habilitados (paguemenos, fabrica, ia, vendas, deploy, calendario).
 *
 * Regras de Ouro:
 *   - NÃO apaga tabelas existentes (SoftwareProject, ProjectBriefing, etc).
 *   - Idempotente: pode ser rodado múltiplas vezes sem duplicar dados.
 *   - Usa upsert/findFirst+create para não quebrar dados já existentes.
 *
 * Run: bunx tsx prisma/seed.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "clodoaldosilva608@gmail.com";
const ADMIN_SUPABASE_ID = "87540e8b-d46e-4ac6-8a1b-5c030e320317";
const PAGUEMENOS_SUBDOMAIN = "paguemenos";

// "Paid Forever" = 10 anos a partir de hoje (praticamente forever para testes)
const PAID_FOREVER_YEARS = 10;

// Módulos a serem habilitados para o PagueMenos (plano Enterprise)
const ENTERPRISE_MODULES = [
  "paguemenos",
  "fabrica",
  "vendas",
  "ia",
  "deploy",
  "calendario",
];

async function main() {
  console.log("🌱 Iniciando seed do Orion SaaS Platform...\n");

  // ================================================================
  // 1. PAGUEMENOS — Tenant principal (Company id=1)
  // ================================================================
  const paidForever = new Date();
  paidForever.setFullYear(paidForever.getFullYear() + PAID_FOREVER_YEARS);

  let company = await prisma.company.findFirst({
    where: { id: 1n },
  });

  if (!company) {
    // Try by subdomain or tradeName
    company = await prisma.company.findFirst({
      where: {
        OR: [
          { subdomain: PAGUEMENOS_SUBDOMAIN },
          { tradeName: { contains: "PagueMenos", mode: "insensitive" } },
        ],
      },
    });
  }

  if (company) {
    company = await prisma.company.update({
      where: { id: company.id },
      data: {
        tradeName: company.tradeName || "PagueMenos",
        legalName: company.legalName || "PagueMenos Farmácias S.A.",
        subdomain: PAGUEMENOS_SUBDOMAIN,
        primaryColor: "#DC2626",
        secondaryColor: "#EF4444",
        backgroundColor: "#0f111a",
        appName: "PagueMenos",
        plan: "enterprise",
        active: true,
        country: "BR",
        email: company.email || "contato@paguemenos.com.br",
        onboardingCompleted: true,
        theme: "orion-dark",
        language: "pt",
        currency: "BRL",
        timezone: "America/Sao_Paulo",
      },
    });
    console.log(`✓ Empresa atualizada: ${company.tradeName} (id=${company.id})`);
  } else {
    company = await prisma.company.create({
      data: {
        tradeName: "PagueMenos",
        legalName: "PagueMenos Farmácias S.A.",
        subdomain: PAGUEMENOS_SUBDOMAIN,
        primaryColor: "#DC2626",
        secondaryColor: "#EF4444",
        backgroundColor: "#0f111a",
        appName: "PagueMenos",
        plan: "enterprise",
        active: true,
        country: "BR",
        email: "contato@paguemenos.com.br",
        onboardingCompleted: true,
        theme: "orion-dark",
        language: "pt",
        currency: "BRL",
        timezone: "America/Sao_Paulo",
      },
    });
    console.log(`✓ Empresa criada: ${company.tradeName} (id=${company.id})`);
  }

  // ================================================================
  // 2. LICENSE — "Paid Forever" (Enterprise, status=active, 10 anos)
  // ================================================================
  let license = await prisma.license.findFirst({
    where: { companies: { some: { id: company.id } } },
  });

  const licenseData = {
    plan: "enterprise" as const,
    status: "active" as const,
    maxUsers: 500,
    maxBranches: 100,
    maxIndicators: 999,
    startDate: new Date(),
    expirationDate: paidForever,
    trialEndsAt: null,
    active: true,
    price: 49900,
    currency: "BRL",
    notes: `Paid Forever — Enterprise license for ${company.tradeName}. Valid for ${PAID_FOREVER_YEARS} years (seed).`,
    metadata: {
      seeded: true,
      seededAt: new Date().toISOString(),
      plan: "paid_forever",
    },
  };

  if (license) {
    license = await prisma.license.update({
      where: { id: license.id },
      data: licenseData,
    });
    console.log(`✓ Licença atualizada: Enterprise (id=${license.id}) — Paid Forever até ${paidForever.toISOString().split("T")[0]}`);
  } else {
    license = await prisma.license.create({ data: licenseData });
    console.log(`✓ Licença criada: Enterprise (id=${license.id}) — Paid Forever até ${paidForever.toISOString().split("T")[0]}`);
  }

  // Link license to company if not yet linked
  if (!company.licenseId || company.licenseId !== license.id) {
    await prisma.company.update({
      where: { id: company.id },
      data: {
        licenseId: license.id,
        licenseExpiresAt: paidForever,
      },
    });
    console.log(`✓ Licença linkada à empresa`);
  }

  // ================================================================
  // 3. SUPER ADMIN USER
  // ================================================================
  let adminUser = await prisma.user.findFirst({
    where: { email: { equals: ADMIN_EMAIL, mode: "insensitive" } },
  });

  if (adminUser) {
    adminUser = await prisma.user.update({
      where: { id: adminUser.id },
      data: {
        isSuperAdmin: true,
        status: "active",
        companyId: company.id,
        jobTitle: "Super Administrador",
        department: "Direção",
        emailVerifiedAt: adminUser.emailVerifiedAt ?? new Date(),
        active: true,
      },
    });
    console.log(`✓ Usuário atualizado: ${adminUser.email} (Super Admin)`);
  } else {
    adminUser = await prisma.user.create({
      data: {
        companyId: company.id,
        supabaseId: ADMIN_SUPABASE_ID,
        name: "Clodoaldo Silva",
        email: ADMIN_EMAIL,
        status: "active",
        emailVerifiedAt: new Date(),
        jobTitle: "Super Administrador",
        department: "Direção",
        isSuperAdmin: true,
        active: true,
      },
    });
    console.log(`✓ Usuário criado: ${adminUser.email} (Super Admin)`);
  }

  // ================================================================
  // 4. ENABLED MODULES — Enterprise tem todos os módulos
  // ================================================================
  for (const moduleKey of ENTERPRISE_MODULES) {
    await prisma.enabledModule.upsert({
      where: {
        companyId_moduleKey: {
          companyId: company.id,
          moduleKey,
        },
      },
      update: { enabled: true, grantedBy: adminUser.id },
      create: {
        companyId: company.id,
        moduleKey,
        enabled: true,
        grantedBy: adminUser.id,
      },
    });
  }
  console.log(`✓ ${ENTERPRISE_MODULES.length} módulos habilitados: ${ENTERPRISE_MODULES.join(", ")}`);

  // ================================================================
  // 5. BRANCH MATRIZ (caso não exista)
  // ================================================================
  let branch = await prisma.branch.findFirst({
    where: { companyId: company.id, code: "MATRIZ" },
  });
  if (!branch) {
    branch = await prisma.branch.create({
      data: {
        companyId: company.id,
        code: "MATRIZ",
        name: "Matriz",
        country: "BR",
        status: "active",
        isHeadquarters: true,
      },
    });
    console.log(`✓ Branch Matriz criada`);
  } else {
    console.log(`✓ Branch Matriz já existe`);
  }

  // ================================================================
  // 6. ADMIN ROLE (caso não exista)
  // ================================================================
  let adminRole = await prisma.role.findFirst({
    where: { companyId: company.id, slug: "admin" },
  });
  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: {
        companyId: company.id,
        name: "Administrador",
        slug: "admin",
        description: "Acesso total à empresa",
        isSystem: true,
      },
    });
    console.log(`✓ Role Admin criada`);
  }

  // Link admin user to role
  if (!adminUser.roleId) {
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { roleId: adminRole.id, branchId: branch.id },
    });
    console.log(`✓ Admin user linkado à role e branch`);
  }

  // ================================================================
  // 7. SaaS MODELS (preserve existing seed functionality)
  // ================================================================

  // SaasUser
  await prisma.saasUser.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role: "super_admin" },
    create: {
      email: ADMIN_EMAIL,
      name: "Clodoaldo Silva",
      role: "super_admin",
      supabaseId: ADMIN_SUPABASE_ID,
    },
  });
  console.log(`✓ SaasUser OK`);

  // Product (PagueMenos como produto vendável)
  let product = await prisma.product.findUnique({ where: { slug: "projeto-paguemenos" } });
  if (!product) {
    product = await prisma.product.create({
      data: {
        name: "PagueMenos - Gestão Comercial",
        slug: "projeto-paguemenos",
        description: "Plataforma de gestão comercial com IA — vendas, metas, ranking, campanhas, workflow de aprovação.",
        repoUrl: "https://github.com/clodoaldosilva608/Projeto-Orion",
        demoUrl: "https://projeto-paguemenos.vercel.app",
        category: "gestao_comercial",
        priceCents: 29900,
        status: "active",
        features: [
          "Metas e Indicadores",
          "Ranking Gamificado",
          "Campanhas & Premiações",
          "Workflow de Aprovação",
          "IA Integrada",
          "PWA Instalável",
          "Multi-filial",
          "Dashboard em tempo real",
        ],
        iconColor: "#DC2626",
      },
    });
    console.log(`✓ Produto PagueMenos criado`);
  } else {
    console.log(`✓ Produto PagueMenos já existe`);
  }

  // ================================================================
  // RESUMO FINAL
  // ================================================================
  console.log("\n" + "=".repeat(60));
  console.log("✅ SEED COMPLETO!");
  console.log("=".repeat(60));
  console.log(`   Empresa: ${company.tradeName} (id=${company.id})`);
  console.log(`   Subdomínio: ${company.subdomain}`);
  console.log(`   AppName: ${company.appName}`);
  console.log(`   Cores: ${company.primaryColor} / ${company.secondaryColor}`);
  console.log(`   Licença: Enterprise (Paid Forever até ${paidForever.toISOString().split("T")[0]})`);
  console.log(`   Módulos: ${ENTERPRISE_MODULES.length} ativos`);
  console.log(`   Super Admin: ${adminUser.email}`);
  console.log(`   Supabase ID: ${adminUser.supabaseId}`);
  console.log("=".repeat(60));
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
