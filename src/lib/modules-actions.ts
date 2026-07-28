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
  company?: { id: string; tradeName: string; plan: string };
  license?: { status: string; expirationDate: Date } | null;
}> {
  const user = await getCurrentUser();
  if (!user) return { active: false, reason: "Não autenticado" };

  // Super Admin sempre tem acesso
  if (user.isSuperAdmin) {
    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      select: { id: true, tradeName: true, plan: true, licenseId: true },
    });
    return {
      active: true,
      company: company ? { id: company.id.toString(), tradeName: company.tradeName, plan: company.plan } : undefined,
      license: null,
    };
  }

  const company = await prisma.company.findUnique({
    where: { id: user.companyId },
    select: {
      id: true, tradeName: true, plan: true, active: true,
      license: { select: { status: true, expirationDate: true, active: true } },
    },
  });

  if (!company) return { active: false, reason: "Empresa não encontrada" };
  if (!company.active) return { active: false, reason: "Empresa suspensa", company: { id: company.id.toString(), tradeName: company.tradeName, plan: company.plan } };
  if (!company.license || company.license.status !== 'active') {
    return {
      active: false,
      reason: "Licença inativa",
      company: { id: company.id.toString(), tradeName: company.tradeName, plan: company.plan },
      license: company.license,
    };
  }
  if (company.license.expirationDate < new Date()) {
    return {
      active: false,
      reason: "Licença expirada",
      company: { id: company.id.toString(), tradeName: company.tradeName, plan: company.plan },
      license: company.license,
    };
  }

  return {
    active: true,
    company: { id: company.id.toString(), tradeName: company.tradeName, plan: company.plan },
    license: company.license,
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
