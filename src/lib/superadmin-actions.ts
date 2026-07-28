/**
 * Super Admin actions — SaaS Multi-Tenant management
 *
 * Only users with isSuperAdmin=true can access these actions.
 * Super Admins can:
 *   - List all companies (tenants)
 *   - Create new companies with subdomain + colors + plan
 *   - Suspend/activate companies (via License status)
 *   - View platform-wide stats
 */
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import { createSupabaseServerClient } from "./supabase";
import { logAudit } from "./audit";

async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
  });
  if (!dbUser) return null;
  return dbUser;
}

async function requireSuperAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.isSuperAdmin) return null;
  return user;
}

// ================================================================
// STATS — platform-wide
// ================================================================

export async function getSuperAdminStatsAction() {
  const user = await requireSuperAdmin();
  if (!user) return { data: null, error: "Acesso negado — Super Admin apenas" };

  try {
    const [companies, activeCompanies, suspendedCompanies, totalUsers, projects, licenses] = await Promise.all([
      prisma.company.count({ where: { deletedAt: null } }),
      prisma.company.count({ where: { deletedAt: null, active: true } }),
      prisma.company.count({ where: { deletedAt: null, active: false } }),
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.softwareProject.count({ where: { deletedAt: null } }),
      prisma.license.count({ where: { deletedAt: null } }),
    ]);

    // Companies by plan
    const byPlan = await prisma.company.groupBy({
      by: ["plan"],
      where: { deletedAt: null },
      _count: true,
    });
    const planCounts: Record<string, number> = {};
    for (const p of byPlan) planCounts[p.plan] = p._count;

    return {
      data: {
        companies,
        activeCompanies,
        suspendedCompanies,
        totalUsers,
        projects,
        licenses,
        byPlan: planCounts,
      },
      error: null,
    };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

// ================================================================
// COMPANIES — list + create + suspend/activate
// ================================================================

export async function listAllCompaniesAction() {
  const user = await requireSuperAdmin();
  if (!user) return { data: null, error: "Acesso negado" };

  try {
    const companies = await prisma.company.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        license: { select: { plan: true, status: true, maxUsers: true } },
        _count: { select: { users: true, branches: true } },
      },
    });

    return {
      data: companies.map((c) => ({
        id: c.id.toString(),
        tradeName: c.tradeName,
        legalName: c.legalName,
        subdomain: c.subdomain,
        customDomain: c.customDomain,
        primaryColor: c.primaryColor,
        secondaryColor: c.secondaryColor,
        appName: c.appName,
        logoUrl: c.logoUrl,
        plan: c.plan,
        active: c.active,
        createdAt: c.createdAt.toISOString(),
        usersCount: c._count.users,
        branchesCount: c._count.branches,
        license: c.license
          ? {
              plan: c.license.plan,
              status: c.license.status,
              maxUsers: c.license.maxUsers,
            }
          : null,
      })),
      error: null,
    };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function createCompanyAction(data: {
  tradeName: string;
  legalName: string;
  subdomain: string;
  primaryColor?: string;
  secondaryColor?: string;
  appName?: string;
  plan?: string;
  email?: string;
  phone?: string;
}) {
  const user = await requireSuperAdmin();
  if (!user) return { data: null, error: "Acesso negado" };

  try {
    if (!data.tradeName?.trim() || !data.subdomain?.trim()) {
      return { data: null, error: "Nome e subdomínio são obrigatórios" };
    }

    // Check subdomain uniqueness
    const existing = await prisma.company.findFirst({
      where: {
        subdomain: { equals: data.subdomain.toLowerCase(), mode: "insensitive" },
        deletedAt: null,
      },
    });
    if (existing) {
      return { data: null, error: "Subdomínio já está em uso" };
    }

    // Create License first
    const license = await prisma.license.create({
      data: {
        plan: (data.plan ?? "free") as any,
        status: "trial",
        maxUsers: data.plan === "enterprise" ? 100 : data.plan === "pro" ? 50 : data.plan === "starter" ? 20 : 5,
        maxBranches: data.plan === "enterprise" ? 20 : data.plan === "pro" ? 10 : 1,
        maxIndicators: 50,
        startDate: new Date(),
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day trial
      },
    });

    // Create Company
    const company = await prisma.company.create({
      data: {
        tradeName: data.tradeName.trim(),
        legalName: data.legalName?.trim() || data.tradeName.trim(),
        subdomain: data.subdomain.toLowerCase().trim(),
        primaryColor: data.primaryColor ?? "#8b5cf6",
        secondaryColor: data.secondaryColor ?? "#6366f1",
        appName: data.appName ?? data.tradeName.trim(),
        plan: (data.plan ?? "free") as any,
        email: data.email ?? null,
        phone: data.phone ?? null,
        licenseId: license.id,
        licenseExpiresAt: license.expirationDate,
        active: true,
        country: "BR",
      },
    });

    await logAudit({
      companyId: company.id,
      userId: user.id,
      action: "create",
      tableName: "companies",
      recordId: company.id,
      newValue: { tradeName: company.tradeName, subdomain: company.subdomain, plan: company.plan },
    });

    revalidatePath("/superadmin");
    return { data: { id: company.id.toString(), subdomain: company.subdomain }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function toggleCompanyStatusAction(companyId: string) {
  const user = await requireSuperAdmin();
  if (!user) return { data: null, error: "Acesso negado" };

  try {
    const company = await prisma.company.findUnique({
      where: { id: BigInt(companyId) },
      include: { license: true },
    });
    if (!company) return { data: null, error: "Empresa não encontrada" };

    const newActive = !company.active;

    // Update company
    await prisma.company.update({
      where: { id: BigInt(companyId) },
      data: { active: newActive },
    });

    // Update license status
    if (company.license) {
      await prisma.license.update({
        where: { id: company.license.id },
        data: {
          status: newActive ? "active" : "suspended",
          active: newActive,
        },
      });
    }

    await logAudit({
      companyId: BigInt(companyId),
      userId: user.id,
      action: "update",
      tableName: "companies",
      recordId: BigInt(companyId),
      newValue: { active: newActive },
    });

    revalidatePath("/superadmin");
    return { data: { active: newActive }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

// ================================================================
// ADVANCED LICENSE ACTIONS — prorrogar, cancelar, ativar, resetar
// ================================================================

/**
 * Prorrogar trial por N dias adicionais.
 */
export async function extendTrialAction(companyId: string, days: number) {
  const user = await requireSuperAdmin();
  if (!user) return { error: "Acesso negado" };
  if (!days || days < 1 || days > 365) return { error: "Dias inválido (1-365)" };

  try {
    const company = await prisma.company.findUnique({
      where: { id: BigInt(companyId) },
      include: { license: true },
    });
    if (!company) return { error: "Empresa não encontrada" };
    if (!company.license) return { error: "Empresa sem licença" };

    const baseDate = company.license.trialEndsAt && company.license.trialEndsAt > new Date()
      ? company.license.trialEndsAt
      : new Date();
    const newTrialEnd = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);

    await prisma.license.update({
      where: { id: company.license.id },
      data: {
        status: "trial",
        active: true,
        trialEndsAt: newTrialEnd,
        expirationDate: newTrialEnd,
      },
    });
    await prisma.company.update({
      where: { id: company.id },
      data: { active: true, licenseExpiresAt: newTrialEnd, trialEndsAt: newTrialEnd },
    });

    await logAudit({
      companyId: BigInt(companyId),
      userId: user.id,
      action: "update",
      tableName: "licenses",
      recordId: company.license.id,
      oldValue: { trialEndsAt: company.license.trialEndsAt },
      newValue: { trialEndsAt: newTrialEnd, extendedByDays: days },
    });

    revalidatePath("/superadmin");
    revalidatePath(`/superadmin/empresas/${companyId}`);
    return { error: null, newTrialEnd: newTrialEnd.toISOString() };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

/**
 * Cancelar assinatura definitivamente.
 * Cancela no Stripe + marca License.canceled + Company.active=false.
 */
export async function cancelCompanyAction(companyId: string, reason?: string) {
  const user = await requireSuperAdmin();
  if (!user) return { error: "Acesso negado" };

  try {
    const company = await prisma.company.findUnique({
      where: { id: BigInt(companyId) },
      include: { license: true },
    });
    if (!company) return { error: "Empresa não encontrada" };

    // Cancela no Stripe se tiver stripeCustomerId
    if (company.stripeCustomerId && process.env.STRIPE_SECRET_KEY) {
      try {
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" as any });

        // Lista subscriptions ativas do customer
        const subs = await stripe.subscriptions.list({
          customer: company.stripeCustomerId,
          status: "active",
        });
        for (const sub of subs.data) {
          await stripe.subscriptions.cancel(sub.id);
          console.log(`[cancelCompany] Stripe subscription ${sub.id} canceled`);
        }
      } catch (stripeErr: any) {
        console.warn("[cancelCompany] Stripe cancel failed:", stripeErr.message);
        // Continua mesmo se Stripe falhar
      }
    }

    // Atualiza License
    if (company.license) {
      await prisma.license.update({
        where: { id: company.license.id },
        data: {
          status: "canceled",
          active: false,
          metadata: {
            ...(company.license.metadata as any ?? {}),
            canceledAt: new Date().toISOString(),
            cancelReason: reason || "Canceled by admin",
            canceledBy: user.id.toString(),
          },
        },
      });
    }

    // Suspende Company
    await prisma.company.update({
      where: { id: company.id },
      data: { active: false },
    });

    await logAudit({
      companyId: BigInt(companyId),
      userId: user.id,
      action: "update",
      tableName: "companies",
      recordId: BigInt(companyId),
      newValue: { status: "canceled", reason },
    });

    revalidatePath("/superadmin");
    revalidatePath(`/superadmin/empresas/${companyId}`);
    return { error: null };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

/**
 * Ativar manualmente — para clientes que pagam por fora (PIX, boleto, cortesia).
 * Não passa pelo Stripe.
 */
export async function activateManuallyAction(companyId: string, plan: string, expiresAt?: string) {
  const user = await requireSuperAdmin();
  if (!user) return { error: "Acesso negado" };
  if (!["free", "starter", "pro", "enterprise"].includes(plan)) {
    return { error: "Plano inválido" };
  }

  try {
    const company = await prisma.company.findUnique({
      where: { id: BigInt(companyId) },
      include: { license: true },
    });
    if (!company) return { error: "Empresa não encontrada" };

    const expirationDate = expiresAt ? new Date(expiresAt) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    const planConfig: Record<string, { maxUsers: number; maxBranches: number }> = {
      free: { maxUsers: 5, maxBranches: 1 },
      starter: { maxUsers: 20, maxBranches: 3 },
      pro: { maxUsers: 50, maxBranches: 10 },
      enterprise: { maxUsers: 100, maxBranches: 20 },
    };
    const cfg = planConfig[plan];

    if (company.license) {
      await prisma.license.update({
        where: { id: company.license.id },
        data: {
          plan: plan as any,
          status: "active",
          active: true,
          maxUsers: cfg.maxUsers,
          maxBranches: cfg.maxBranches,
          expirationDate,
          trialEndsAt: null,
          metadata: {
            ...(company.license.metadata as any ?? {}),
            manualActivation: true,
            activatedAt: new Date().toISOString(),
            activatedBy: user.id.toString(),
          },
        },
      });
    } else {
      const license = await prisma.license.create({
        data: {
          plan: plan as any,
          status: "active",
          active: true,
          maxUsers: cfg.maxUsers,
          maxBranches: cfg.maxBranches,
          maxIndicators: 50,
          startDate: new Date(),
          expirationDate,
          metadata: { manualActivation: true, activatedAt: new Date().toISOString(), activatedBy: user.id.toString() },
        },
      });
      await prisma.company.update({
        where: { id: company.id },
        data: { licenseId: license.id, licenseExpiresAt: expirationDate },
      });
    }

    await prisma.company.update({
      where: { id: company.id },
      data: { active: true, plan: plan as any, licenseExpiresAt: expirationDate },
    });

    await logAudit({
      companyId: BigInt(companyId),
      userId: user.id,
      action: "update",
      tableName: "licenses",
      recordId: BigInt(companyId),
      newValue: { plan, status: "active", expirationDate, manualActivation: true },
    });

    revalidatePath("/superadmin");
    revalidatePath(`/superadmin/empresas/${companyId}`);
    return { error: null };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

/**
 * Resetar trial — recomeça trial de 14 dias.
 */
export async function resetTrialAction(companyId: string) {
  const user = await requireSuperAdmin();
  if (!user) return { error: "Acesso negado" };

  try {
    const company = await prisma.company.findUnique({
      where: { id: BigInt(companyId) },
      include: { license: true },
    });
    if (!company) return { error: "Empresa não encontrada" };
    if (!company.license) return { error: "Empresa sem licença" };

    const newTrialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    await prisma.license.update({
      where: { id: company.license.id },
      data: {
        status: "trial",
        active: true,
        trialEndsAt: newTrialEnd,
        expirationDate: newTrialEnd,
        plan: "free",
        metadata: {
          ...(company.license.metadata as any ?? {}),
          trialResetAt: new Date().toISOString(),
          resetBy: user.id.toString(),
        },
      },
    });
    await prisma.company.update({
      where: { id: company.id },
      data: { active: true, licenseExpiresAt: newTrialEnd, trialEndsAt: newTrialEnd, plan: "free" },
    });

    await logAudit({
      companyId: BigInt(companyId),
      userId: user.id,
      action: "update",
      tableName: "licenses",
      recordId: company.license.id,
      newValue: { status: "trial", trialEndsAt: newTrialEnd, reset: true },
    });

    revalidatePath("/superadmin");
    revalidatePath(`/superadmin/empresas/${companyId}`);
    return { error: null, newTrialEnd: newTrialEnd.toISOString() };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

/**
 * Detalhes de uma empresa (para a página de detalhe).
 */
export async function getCompanyDetailAction(companyId: string) {
  const user = await requireSuperAdmin();
  if (!user) return { data: null, error: "Acesso negado" };

  try {
    const company = await prisma.company.findUnique({
      where: { id: BigInt(companyId) },
      include: {
        license: true,
        users: { select: { id: true, name: true, email: true, status: true, isSuperAdmin: true, lastLoginAt: true, createdAt: true }, take: 50 },
        branches: { select: { id: true, code: true, name: true, status: true } },
        enabledModules: { select: { moduleKey: true, enabled: true, grantedAt: true } },
        auditLogs: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: { id: true, action: true, tableName: true, oldValue: true, newValue: true, createdAt: true, userId: true },
        },
        _count: { select: { users: true, branches: true, indicators: true, goals: true, softwareProjects: true } },
      },
    });
    if (!company) return { data: null, error: "Empresa não encontrada" };

    return {
      data: {
        ...company,
        id: company.id.toString(),
        licenseId: company.licenseId?.toString() ?? null,
        license: company.license ? { ...company.license, id: company.license.id.toString() } : null,
        users: company.users.map((u) => ({ ...u, id: u.id.toString() })),
        branches: company.branches.map((b) => ({ ...b, id: b.id.toString() })),
        auditLogs: company.auditLogs.map((a) => ({ ...a, id: a.id.toString(), userId: a.userId?.toString() })),
      },
      error: null,
    };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}
