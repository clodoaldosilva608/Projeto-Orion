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
