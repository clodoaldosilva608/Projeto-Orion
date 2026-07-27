"use server";

/**
 * P17 — Licenciamento de Software + Workspace do Cliente
 *
 * Features:
 *   - generateLicenseAction: cria licença após entrega do projeto
 *   - validateLicenseAction: valida licença online (status, expiração)
 *   - revokeLicenseAction: revoga licença
 *   - extendLicenseAction: estende data de expiração
 *   - getWorkspaceDataAction: busca dados do projeto para o cliente
 *     (público via workspaceToken)
 */
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

// Generate a license key: ORION-XXXX-XXXX-XXXX-XXXX
function generateLicenseKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusing chars (0, O, 1, I)
  const segment = () => {
    let s = "";
    for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  };
  return `ORION-${segment()}-${segment()}-${segment()}-${segment()}`;
}

// Generate a workspace token: ws_xxxxxxxxxxxxxxxx
function generateWorkspaceToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let t = "ws_";
  for (let i = 0; i < 24; i++) t += chars[Math.floor(Math.random() * chars.length)];
  return t;
}

// ================================================================
// ADMIN — generate, list, revoke, extend
// ================================================================

export async function generateLicenseAction(projectId: string, params: {
  clientEmail: string;
  clientName: string;
  plan?: string;
  maxUsers?: number;
  expiresAt?: string;
  productionUrl?: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const project = await prisma.softwareProject.findFirst({
      where: { id: BigInt(projectId), companyId: user.companyId, deletedAt: null },
      include: { briefing: true },
    });
    if (!project) return { data: null, error: "Projeto não encontrado" };

    // Check if license already exists
    const existing = await prisma.softwareLicense.findUnique({
      where: { projectId: BigInt(projectId) },
    });
    if (existing) {
      return { data: null, error: "Este projeto já possui uma licença" };
    }

    const licenseKey = generateLicenseKey();
    const workspaceToken = generateWorkspaceToken();

    const license = await prisma.softwareLicense.create({
      data: {
        companyId: user.companyId,
        projectId: BigInt(projectId),
        clientEmail: params.clientEmail,
        clientName: params.clientName,
        licenseKey,
        workspaceToken,
        status: "active",
        plan: params.plan ?? "standard",
        maxUsers: params.maxUsers ?? 10,
        activatedAt: new Date(),
        expiresAt: params.expiresAt ? new Date(params.expiresAt) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year default
        productionUrl: params.productionUrl || project.productionUrl || null,
      },
    });

    // Update project with license reference
    await prisma.softwareProject.update({
      where: { id: BigInt(projectId) },
      data: { licenseId: license.id.toString(), status: "delivered", deliveredAt: new Date() },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "create",
      tableName: "software_licenses",
      recordId: license.id,
      newValue: { licenseKey: license.licenseKey, clientName: license.clientName },
    });

    revalidatePath(`/fabrica/projetos/${projectId}`);
    return {
      data: {
        id: license.id.toString(),
        licenseKey: license.licenseKey,
        workspaceToken: license.workspaceToken,
      },
      error: null,
    };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function listLicensesAction() {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const licenses = await prisma.softwareLicense.findMany({
      where: { companyId: user.companyId },
      orderBy: { createdAt: "desc" },
      include: {
        project: { select: { name: true, status: true } },
        _count: { select: { validations: true } },
      },
    });

    return {
      data: licenses.map((l) => ({
        ...l,
        id: l.id.toString(),
        companyId: l.companyId.toString(),
        projectId: l.projectId?.toString() ?? null,
        activatedAt: l.activatedAt?.toISOString() ?? null,
        expiresAt: l.expiresAt?.toISOString() ?? null,
        lastValidatedAt: l.lastValidatedAt?.toISOString() ?? null,
        revokedAt: l.revokedAt?.toISOString() ?? null,
        createdAt: l.createdAt.toISOString(),
        projectName: l.project?.name ?? "—",
        validationsCount: l._count.validations,
      })),
      error: null,
    };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function revokeLicenseAction(licenseId: string, reason: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    await prisma.softwareLicense.updateMany({
      where: { id: BigInt(licenseId), companyId: user.companyId },
      data: {
        status: "revoked",
        revokedAt: new Date(),
        revokeReason: reason,
      },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "update",
      tableName: "software_licenses",
      recordId: BigInt(licenseId),
      newValue: { status: "revoked", reason },
    });

    revalidatePath("/fabrica");
    return { data: { ok: true }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function extendLicenseAction(licenseId: string, newExpiresAt: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    await prisma.softwareLicense.updateMany({
      where: { id: BigInt(licenseId), companyId: user.companyId },
      data: {
        expiresAt: new Date(newExpiresAt),
        status: "active", // re-activate if was expired
      },
    });

    revalidatePath("/fabrica");
    return { data: { ok: true }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

// ================================================================
// PUBLIC — workspace + validation
// ================================================================

export async function getWorkspaceDataAction(workspaceToken: string) {
  try {
    const license = await prisma.softwareLicense.findUnique({
      where: { workspaceToken },
      include: {
        project: {
          include: {
            stages: { orderBy: { sortOrder: "asc" } },
            briefing: {
              select: {
                clientName: true, clientCompany: true, clientEmail: true,
                problemStatement: true, keyFeatures: true,
              },
            },
            template: {
              select: { displayName: true, iconEmoji: true, iconColor: true },
            },
          },
        },
      },
    });
    if (!license || !license.project) {
      return { data: null, error: "Workspace não encontrado" };
    }

    const p = license.project;
    const completedStages = p.stages.filter((s) => s.status === "completed").length;
    const progress = p.stages.length > 0 ? Math.round((completedStages / p.stages.length) * 100) : 0;

    return {
      data: {
        project: {
          name: p.name,
          description: p.description,
          status: p.status,
          progress,
          stack: p.stack,
          keyFeatures: p.keyFeatures,
          startDate: p.startDate?.toISOString() ?? null,
          estimatedEndDate: p.estimatedEndDate?.toISOString() ?? null,
          deliveredAt: p.deliveredAt?.toISOString() ?? null,
          productionUrl: p.productionUrl,
          demoUrl: p.demoUrl,
          template: p.template
            ? { name: p.template.displayName, emoji: p.template.iconEmoji, color: p.template.iconColor }
            : null,
        },
        client: {
          name: license.clientName,
          email: license.clientEmail,
        },
        license: {
          status: license.status,
          plan: license.plan,
          expiresAt: license.expiresAt?.toISOString() ?? null,
          activatedAt: license.activatedAt?.toISOString() ?? null,
          productionUrl: license.productionUrl,
        },
        stages: p.stages.map((s) => ({
          id: s.id.toString(),
          name: s.name,
          status: s.status,
          sortOrder: s.sortOrder,
          startDate: s.startDate?.toISOString() ?? null,
          completedAt: s.completedAt?.toISOString() ?? null,
          deliverables: s.deliverables,
          notes: s.notes,
        })),
        briefing: p.briefing
          ? {
              problemStatement: p.briefing.problemStatement,
              keyFeatures: p.briefing.keyFeatures,
            }
          : null,
      },
      error: null,
    };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function validateLicenseAction(licenseKey: string, metadata?: {
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    const license = await prisma.softwareLicense.findUnique({
      where: { licenseKey },
    });

    let isValid = false;
    let reason = "";

    if (!license) {
      isValid = false;
      reason = "Licença não encontrada";
    } else if (license.status === "revoked") {
      isValid = false;
      reason = "Licença revogada";
    } else if (license.status === "suspended") {
      isValid = false;
      reason = "Licença suspensa";
    } else if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
      isValid = false;
      reason = "Licença expirada";
    } else if (license.status === "pending_activation") {
      isValid = false;
      reason = "Licença não ativada";
    } else {
      isValid = true;
      reason = "Licença válida";
      // Update last validated
      await prisma.softwareLicense.update({
        where: { id: license.id },
        data: { lastValidatedAt: new Date() },
      });
    }

    // Log validation
    if (license) {
      await prisma.licenseValidation.create({
        data: {
          licenseId: license.id,
          ipAddress: metadata?.ipAddress ?? null,
          userAgent: metadata?.userAgent ?? null,
          isValid,
          reason,
        },
      });
    }

    return {
      data: {
        valid: isValid,
        reason,
        status: license?.status ?? "not_found",
        clientName: license?.clientName ?? null,
        plan: license?.plan ?? null,
        expiresAt: license?.expiresAt?.toISOString() ?? null,
      },
      error: null,
    };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}
