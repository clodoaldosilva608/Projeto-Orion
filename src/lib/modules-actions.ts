/**
 * Module Management Actions — SaaS Multi-Tenant
 *
 * Permite ao Super Admin ativar/desativar módulos para cada empresa.
 * Módulos disponíveis: paguemenos, vendas, fabrica, ia, deploy, calendario
 *
 * Também expõe helpers para verificar se uma empresa tem licença ativa
 * e se um módulo específico está habilitado.
 */
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import { createSupabaseServerClient } from "./supabase";
import { logAudit } from "./audit";
import { MODULE_KEYS } from "./modules-catalog";

// ================================================================
// HELPERS
// ================================================================
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

/**
 * Verifica se a empresa do usuário logado tem licença ativa.
 * Usado pelo dashboard layout para barrar acesso se expirou.
 */
export async function checkCompanyLicense(): Promise<{
  active: boolean;
  reason?: string;
  status?: "ok" | "trial" | "trial_expired" | "suspended" | "canceled" | "expired" | "no_license";
  daysLeft?: number;
  company?: { id: string; tradeName: string; plan: string; onboardingCompleted?: boolean };
  license?: { status: string; expirationDate: Date; trialEndsAt?: Date | null } | null;
}> {
  const user = await getCurrentUser();
  if (!user) return { active: false, reason: "Não autenticado", status: "no_license" };

  // Super Admin sempre tem acesso
  if (user.isSuperAdmin) {
    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      select: { id: true, tradeName: true, plan: true, licenseId: true, onboardingCompleted: true },
    });
    return {
      active: true,
      status: "ok",
      company: company ? { id: company.id.toString(), tradeName: company.tradeName, plan: company.plan, onboardingCompleted: company.onboardingCompleted } : undefined,
      license: null,
    };
  }

  const company = await prisma.company.findUnique({
    where: { id: user.companyId },
    select: {
      id: true, tradeName: true, plan: true, active: true, onboardingCompleted: true,
      license: { select: { status: true, expirationDate: true, active: true, trialEndsAt: true } },
    },
  });

  const companyInfo = { id: company?.id.toString() ?? "", tradeName: company?.tradeName ?? "", plan: company?.plan ?? "free", onboardingCompleted: company?.onboardingCompleted };

  if (!company) return { active: false, reason: "Empresa não encontrada", status: "no_license" };
  if (!company.active) return { active: false, reason: "Empresa suspensa", status: "suspended", company: companyInfo, license: company.license };

  if (!company.license) {
    return { active: false, reason: "Sem licença", status: "no_license", company: companyInfo, license: null };
  }

  const now = new Date();
  const lic = company.license;

  // TRIAL: ativo enquanto trialEndsAt > now
  if (lic.status === 'trial') {
    if (lic.trialEndsAt && lic.trialEndsAt > now) {
      const daysLeft = Math.ceil((lic.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        active: true,
        status: "trial",
        daysLeft,
        company: companyInfo,
        license: lic,
      };
    }
    // Trial expirado
    return {
      active: false,
      reason: "Trial expirado",
      status: "trial_expired",
      company: companyInfo,
      license: lic,
    };
  }

  // ACTIVE: assinatura paga
  if (lic.status === 'active') {
    if (lic.expirationDate < now) {
      return {
        active: false,
        reason: "Licença expirada",
        status: "expired",
        company: companyInfo,
        license: lic,
      };
    }
    return {
      active: true,
      status: "ok",
      company: companyInfo,
      license: lic,
    };
  }

  // SUSPENDED, CANCELED, etc.
  return {
    active: false,
    reason: lic.status === 'canceled' ? "Assinatura cancelada" : "Licença suspensa",
    status: lic.status === 'canceled' ? "canceled" : "suspended",
    company: companyInfo,
    license: lic,
  };
}

/**
 * Verifica se um módulo específico está habilitado para a empresa.
 */
export async function isModuleEnabled(companyId: bigint, moduleKey: string): Promise<boolean> {
  const record = await prisma.enabledModule.findUnique({
    where: {
      companyId_moduleKey: { companyId, moduleKey },
    },
    select: { enabled: true },
  });
  // Se não há registro, módulo não está habilitado (default false)
  return record?.enabled ?? false;
}

/**
 * Lista todos os módulos habilitados para a empresa.
 */
export async function listEnabledModules(companyId: bigint): Promise<string[]> {
  const records = await prisma.enabledModule.findMany({
    where: { companyId, enabled: true },
    select: { moduleKey: true },
  });
  return records.map(r => r.moduleKey);
}

// ================================================================
// SUPER ADMIN ACTIONS — Module management
// ================================================================

export async function listCompaniesWithModulesAction() {
  const user = await requireSuperAdmin();
  if (!user) return { data: null, error: "Acesso negado — Super Admin apenas" };

  try {
    const companies = await prisma.company.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, tradeName: true, subdomain: true, plan: true, active: true,
        primaryColor: true, appName: true,
        license: { select: { plan: true, status: true, expirationDate: true } },
        enabledModules: { select: { moduleKey: true, enabled: true } },
        _count: { select: { users: true } },
      },
    });

    return {
      data: companies.map((c) => ({
        id: c.id.toString(),
        tradeName: c.tradeName,
        subdomain: c.subdomain,
        plan: c.plan,
        active: c.active,
        primaryColor: c.primaryColor,
        appName: c.appName,
        usersCount: c._count.users,
        license: c.license
          ? {
              plan: c.license.plan,
              status: c.license.status,
              expirationDate: c.license.expirationDate,
            }
          : null,
        modules: c.enabledModules.reduce((acc: Record<string, boolean>, m) => {
          acc[m.moduleKey] = m.enabled;
          return acc;
        }, {}),
      })),
      error: null,
    };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function toggleModuleAction(companyId: string, moduleKey: string, enabled: boolean) {
  const user = await requireSuperAdmin();
  if (!user) return { error: "Acesso negado" };

  if (!MODULE_KEYS.includes(moduleKey as any)) {
    return { error: `Módulo inválido. Válidos: ${MODULE_KEYS.join(", ")}` };
  }

  try {
    await prisma.enabledModule.upsert({
      where: {
        companyId_moduleKey: { companyId: BigInt(companyId), moduleKey },
      },
      update: { enabled, grantedBy: user.id, updatedAt: new Date() },
      create: {
        companyId: BigInt(companyId),
        moduleKey,
        enabled,
        grantedBy: user.id,
      },
    });

    await logAudit({
      companyId: BigInt(companyId),
      userId: user.id,
      action: "update",
      tableName: "enabled_modules",
      recordId: BigInt(companyId),
      newValue: { moduleKey, enabled },
    });

    revalidatePath("/superadmin/modules");
    return { error: null };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

/**
 * Ativa um conjunto de módulos para uma empresa (usado após checkout).
 */
export async function enableModulesForCompany(companyId: bigint, moduleKeys: string[]) {
  const user = await getCurrentUser();
  try {
    for (const key of moduleKeys) {
      await prisma.enabledModule.upsert({
        where: {
          companyId_moduleKey: { companyId, moduleKey: key },
        },
        update: { enabled: true },
        create: {
          companyId,
          moduleKey: key,
          enabled: true,
          grantedBy: user?.id,
        },
      });
    }
    return { error: null };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
