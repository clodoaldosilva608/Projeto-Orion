"use server";

import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase";
import { hasPermission, canAccess } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import type { ResultStatus, GoalType } from "@prisma/client";

// ================================================================
// AUTH HELPER
// ================================================================

async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
  });
  if (!dbUser) return null;

  return dbUser;
}

// ================================================================
// INDICATORS
// ================================================================

export async function listIndicatorsAction() {
  const dbUser = await getCurrentUser();
  if (!dbUser) return { data: null, error: "Não autorizado" };

  try {
    const indicators = await prisma.indicator.findMany({
      where: { companyId: dbUser.companyId, active: true },
      include: { category: true },
      orderBy: { sortOrder: "asc" },
    });

    const serialized = indicators.map((ind) => ({
      ...ind,
      id: ind.id.toString(),
      companyId: ind.companyId.toString(),
      categoryId: ind.categoryId ? ind.categoryId.toString() : null,
      createdBy: ind.createdBy?.toString() ?? null,
      updatedBy: ind.updatedBy?.toString() ?? null,
      category: ind.category
        ? {
            ...ind.category,
            id: ind.category.id.toString(),
            companyId: ind.category.companyId.toString(),
          }
        : null,
    }));

    return { data: serialized, error: null };
  } catch (e) {
    console.error("listIndicatorsAction error:", e);
    return { data: null, error: "Erro ao buscar indicadores" };
  }
}

export async function createIndicatorAction(data: {
  name: string;
  description?: string;
  unit?: string;
  formula?: string;
  direction?: string;
  color?: string;
  icon?: string;
  categoryId?: string;
  allowManual?: boolean;
}) {
  const dbUser = await getCurrentUser();
  if (!dbUser) return { data: null, error: "Não autorizado" };

  try {
    const baseSlug = slugify(data.name) || "indicador";
    let slug = baseSlug;
    let suffix = 1;
    while (true) {
      const existing = await prisma.indicator.findUnique({
        where: {
          companyId_slug: {
            companyId: dbUser.companyId,
            slug,
          },
        },
      });
      if (!existing) break;
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    const indicator = await prisma.indicator.create({
      data: {
        companyId: dbUser.companyId,
        categoryId: data.categoryId ? BigInt(data.categoryId) : null,
        name: data.name,
        slug,
        description: data.description,
        unit: data.unit,
        formula: data.formula,
        direction: data.direction || "higher_is_better",
        color: data.color,
        icon: data.icon,
        allowManual: data.allowManual ?? true,
        createdBy: dbUser.id,
      },
    });

    revalidatePath("/indicadores");

    return {
      data: {
        ...indicator,
        id: indicator.id.toString(),
        companyId: indicator.companyId.toString(),
        categoryId: indicator.categoryId?.toString() ?? null,
        createdBy: indicator.createdBy?.toString() ?? null,
        updatedBy: indicator.updatedBy?.toString() ?? null,
      },
      error: null,
    };
  } catch (e) {
    console.error("createIndicatorAction error:", e);
    return {
      data: null,
      error: (e as Error).message || "Erro ao criar o indicador",
    };
  }
}

export async function deleteIndicatorAction(id: string) {
  const dbUser = await getCurrentUser();
  if (!dbUser) return { error: "Não autorizado" };

  try {
    await prisma.indicator.update({
      where: { id: BigInt(id), companyId: dbUser.companyId },
      data: { active: false, deletedAt: new Date() },
    });

    revalidatePath("/indicadores");
    return { error: null };
  } catch (e) {
    console.error("deleteIndicatorAction error:", e);
    return { error: "Erro ao deletar o indicador" };
  }
}

// ================================================================
// CATEGORIES
// ================================================================

export async function listCategoriesAction() {
  const dbUser = await getCurrentUser();
  if (!dbUser) return { data: null, error: "Não autorizado" };

  try {
    const categories = await prisma.indicatorCategory.findMany({
      where: { companyId: dbUser.companyId, active: true },
      orderBy: { sortOrder: "asc" },
    });

    const serialized = categories.map((cat) => ({
      ...cat,
      id: cat.id.toString(),
      companyId: cat.companyId.toString(),
    }));

    return { data: serialized, error: null };
  } catch (e) {
    console.error("listCategoriesAction error:", e);
    return { data: null, error: "Erro ao buscar categorias" };
  }
}

export async function createCategoryAction(data: {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  sortOrder?: number;
}) {
  const dbUser = await getCurrentUser();
  if (!dbUser) return { data: null, error: "Não autorizado" };

  try {
    const category = await prisma.indicatorCategory.create({
      data: {
        companyId: dbUser.companyId,
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        sortOrder: data.sortOrder ?? 0,
      },
    });

    revalidatePath("/indicadores");

    return {
      data: {
        ...category,
        id: category.id.toString(),
        companyId: category.companyId.toString(),
      },
      error: null,
    };
  } catch (e) {
    console.error("createCategoryAction error:", e);
    return {
      data: null,
      error: (e as Error).message || "Erro ao criar a categoria",
    };
  }
}

export async function deleteCategoryAction(id: string) {
  const dbUser = await getCurrentUser();
  if (!dbUser) return { error: "Não autorizado" };

  try {
    await prisma.indicatorCategory.update({
      where: { id: BigInt(id), companyId: dbUser.companyId },
      data: { active: false, deletedAt: new Date() },
    });

    revalidatePath("/indicadores");
    return { error: null };
  } catch (e) {
    console.error("deleteCategoryAction error:", e);
    return { error: "Erro ao deletar a categoria" };
  }
}

// ================================================================
// GOALS
// ================================================================

export async function listGoalsAction() {
  const dbUser = await getCurrentUser();
  if (!dbUser) return { data: null, error: "Não autorizado" };

  try {
    const goals = await prisma.goal.findMany({
      where: { companyId: dbUser.companyId, active: true },
      include: {
        indicator: true,
        results: { where: { status: "approved" } },
      },
      orderBy: { createdAt: "desc" },
    });

    const serialized = goals.map((goal) => ({
      ...goal,
      id: goal.id.toString(),
      companyId: goal.companyId.toString(),
      indicatorId: goal.indicatorId.toString(),
      createdBy: goal.createdBy?.toString() ?? null,
      updatedBy: goal.updatedBy?.toString() ?? null,
      campaignId: goal.campaignId?.toString() ?? null,
      branchId: goal.branchId?.toString() ?? null,
      userId: goal.userId?.toString() ?? null,
      targetValue: Number(goal.targetValue),
      minValue: goal.minValue ? Number(goal.minValue) : null,
      maxValue: goal.maxValue ? Number(goal.maxValue) : null,
      weight: Number(goal.weight),
      startDate: goal.startDate.toISOString(),
      endDate: goal.endDate.toISOString(),
      createdAt: goal.createdAt.toISOString(),
      updatedAt: goal.updatedAt.toISOString(),
      indicator: {
        ...goal.indicator,
        id: goal.indicator.id.toString(),
        companyId: goal.indicator.companyId.toString(),
        categoryId: goal.indicator.categoryId?.toString() ?? null,
      },
      results: goal.results.map((r) => ({
        ...r,
        id: r.id.toString(),
        companyId: r.companyId.toString(),
        goalId: r.goalId.toString(),
        userId: r.userId.toString(),
        value: Number(r.value),
      })),
    }));

    return { data: serialized, error: null };
  } catch (e) {
    console.error("listGoalsAction error:", e);
    return { data: null, error: "Erro ao buscar metas" };
  }
}

export async function createGoalAction(data: {
  name: string;
  description?: string;
  indicatorId: string | number;
  targetValue: number;
  type: GoalType;
  startDate: string;
  endDate: string;
}) {
  const dbUser = await getCurrentUser();
  if (!dbUser) return { data: null, error: "Não autorizado" };

  try {
    const goal = await prisma.goal.create({
      data: {
        companyId: dbUser.companyId,
        indicatorId: BigInt(data.indicatorId),
        name: data.name,
        description: data.description,
        type: data.type,
        targetValue: data.targetValue,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        createdBy: dbUser.id,
      },
    });

    revalidatePath("/metas");
    revalidatePath("/dashboard");

    return {
      data: {
        ...goal,
        id: goal.id.toString(),
        companyId: goal.companyId.toString(),
        indicatorId: goal.indicatorId.toString(),
        createdBy: goal.createdBy?.toString() ?? null,
        targetValue: Number(goal.targetValue),
        weight: Number(goal.weight),
        startDate: goal.startDate.toISOString(),
        endDate: goal.endDate.toISOString(),
      },
      error: null,
    };
  } catch (e) {
    console.error("createGoalAction error:", e);
    return { data: null, error: (e as Error).message || "Erro ao criar a meta" };
  }
}

export async function deleteGoalAction(goalId: string) {
  const dbUser = await getCurrentUser();
  if (!dbUser) return { error: "Não autorizado" };

  try {
    await prisma.goal.update({
      where: { id: BigInt(goalId), companyId: dbUser.companyId },
      data: { active: false, deletedAt: new Date() },
    });

    revalidatePath("/metas");
    revalidatePath("/dashboard");
    return { error: null };
  } catch (e) {
    console.error("deleteGoalAction error:", e);
    return { error: "Erro ao deletar a meta" };
  }
}

// ================================================================
// RESULTS
// ================================================================

export async function listResultsAction(filters?: { status?: ResultStatus }) {
  const dbUser = await getCurrentUser();
  if (!dbUser) return { data: null, error: "Não autorizado" };

  try {
    const results = await prisma.result.findMany({
      where: {
        companyId: dbUser.companyId,
        active: true,
        ...(filters?.status ? { status: filters.status } : {}),
      },
      include: {
        goal: { include: { indicator: true } },
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const serialized = results.map((r) => ({
      ...r,
      id: r.id.toString(),
      companyId: r.companyId.toString(),
      goalId: r.goalId.toString(),
      userId: r.userId.toString(),
      value: Number(r.value),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      referenceDate: r.referenceDate.toISOString(),
      approvedAt: r.approvedAt ? r.approvedAt.toISOString() : null,
      createdBy: r.createdBy?.toString() ?? null,
      updatedBy: r.updatedBy?.toString() ?? null,
      approvedBy: r.approvedBy?.toString() ?? null,
      goal: {
        ...r.goal,
        id: r.goal.id.toString(),
        companyId: r.goal.companyId.toString(),
        indicatorId: r.goal.indicatorId.toString(),
        targetValue: Number(r.goal.targetValue),
        startDate: r.goal.startDate.toISOString(),
        endDate: r.goal.endDate.toISOString(),
        indicator: {
          ...r.goal.indicator,
          id: r.goal.indicator.id.toString(),
          companyId: r.goal.indicator.companyId.toString(),
          categoryId: r.goal.indicator.categoryId?.toString() ?? null,
        },
      },
      user: { ...r.user, id: r.user.id.toString() },
    }));

    return { data: serialized, error: null };
  } catch (e) {
    console.error("listResultsAction error:", e);
    return { data: null, error: "Erro ao buscar resultados" };
  }
}

export async function submitResultAction(data: {
  goalId: string | number;
  value: number;
  referenceDate: string;
  notes?: string;
}) {
  const dbUser = await getCurrentUser();
  if (!dbUser) return { data: null, error: "Não autorizado" };

  try {
    const result = await prisma.result.create({
      data: {
        companyId: dbUser.companyId,
        goalId: BigInt(data.goalId),
        userId: dbUser.id,
        value: data.value,
        referenceDate: new Date(data.referenceDate),
        status: "pending",
        notes: data.notes,
        createdBy: dbUser.id,
      },
    });

    // P8: award points for submitting a result (on-time or late)
    try {
      const hour = new Date().getHours();
      const reasonKey = hour < 18 ? "result_on_time" : "result_late";
      const { awardPointsAction } = await import("./gamification-actions");
      await awardPointsAction({
        userId: dbUser.id,
        reasonKey,
        referenceId: result.id.toString(),
        metadata: { goalId: data.goalId, value: data.value },
      });
    } catch {}

    revalidatePath("/resultados");
    revalidatePath("/aprovacoes");
    revalidatePath("/dashboard");
    revalidatePath("/metas");

    return {
      data: {
        ...result,
        id: result.id.toString(),
        companyId: result.companyId.toString(),
        goalId: result.goalId.toString(),
        userId: result.userId.toString(),
        value: Number(result.value),
        createdBy: result.createdBy?.toString() ?? null,
      },
      error: null,
    };
  } catch (e) {
    console.error("submitResultAction error:", e);
    return {
      data: null,
      error: (e as Error).message || "Erro ao lançar resultado",
    };
  }
}

export async function approveResultAction(resultId: string | number) {
  const dbUser = await getCurrentUser();
  if (!dbUser) return { error: "Não autorizado" };

  try {
    const updated = await prisma.result.update({
      where: { id: BigInt(resultId), companyId: dbUser.companyId },
      data: {
        status: "approved",
        approvedBy: dbUser.id,
        approvedAt: new Date(),
        updatedBy: dbUser.id,
      },
      include: { goal: true, user: true },
    });

    // P6: fire notification + webhook to the result owner.
    try {
      await prisma.notification.create({
        data: {
          companyId: dbUser.companyId,
          userId: updated.userId,
          title: "Resultado aprovado",
          body: `Seu resultado de ${Number(updated.value)} em "${updated.goal?.name ?? "meta"}" foi aprovado por ${dbUser.name}.`,
          channel: "in_app",
          priority: "normal",
          data: { resultId: updated.id.toString(), goalId: updated.goalId.toString() },
        },
      });
    } catch {}

    try {
      const { enqueueWebhook } = await import("./webhooks");
      await enqueueWebhook({
        companyId: dbUser.companyId,
        event: "result.approved",
        payload: {
          resultId: updated.id.toString(),
          goalId: updated.goalId.toString(),
          goalName: updated.goal?.name,
          value: Number(updated.value),
          approvedBy: dbUser.name,
          approvedAt: updated.approvedAt?.toISOString(),
        },
      });
    } catch {}

    // P8: award points to the result owner for having their result approved
    // (this counts toward goal_beat achievements via auto-check)
    try {
      const { awardPointsAction } = await import("./gamification-actions");
      await awardPointsAction({
        userId: updated.userId,
        reasonKey: "goal_monthly_beat", // award 1000 points for approved result (counts toward goal_10/50/100)
        referenceId: updated.id.toString(),
        metadata: { goalId: updated.goalId.toString(), approvedBy: dbUser.id.toString() },
      });
    } catch {}

    revalidatePath("/resultados");
    revalidatePath("/aprovacoes");
    revalidatePath("/dashboard");
    revalidatePath("/metas");
    revalidatePath("/ranking");

    return { error: null };
  } catch (e) {
    console.error("approveResultAction error:", e);
    return { error: "Erro ao aprovar resultado" };
  }
}

export async function rejectResultAction(
  resultId: string | number,
  reason?: string,
) {
  const dbUser = await getCurrentUser();
  if (!dbUser) return { error: "Não autorizado" };

  try {
    const updated = await prisma.result.update({
      where: { id: BigInt(resultId), companyId: dbUser.companyId },
      data: {
        status: "rejected",
        notes: reason
          ? `[Rejeitado: ${reason}]`
          : "[Rejeitado pelo gestor]",
        updatedBy: dbUser.id,
      },
      include: { goal: true },
    });

    // P6: notify the owner.
    try {
      await prisma.notification.create({
        data: {
          companyId: dbUser.companyId,
          userId: updated.userId,
          title: "Resultado rejeitado",
          body: `Seu resultado em "${updated.goal?.name ?? "meta"}" foi rejeitado.${reason ? ` Motivo: ${reason}` : ""}`,
          channel: "in_app",
          priority: "high",
          data: { resultId: updated.id.toString(), goalId: updated.goalId.toString(), reason },
        },
      });
    } catch {}

    revalidatePath("/resultados");
    revalidatePath("/aprovacoes");
    revalidatePath("/dashboard");
    revalidatePath("/metas");
    revalidatePath("/ranking");

    return { error: null };
  } catch (e) {
    console.error("rejectResultAction error:", e);
    return { error: "Erro ao rejeitar resultado" };
  }
}

// ================================================================
// RANKING
// ================================================================

export interface RankingEntry {
  position: number;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  jobTitle: string | null;
  totalValue: number;
  approvedCount: number;
  goalCount: number;
  avgProgress: number;
}

export async function getRankingAction(
  period?: "week" | "month" | "quarter" | "all",
): Promise<{ data: RankingEntry[] | null; error: string | null }> {
  const dbUser = await getCurrentUser();
  if (!dbUser) return { data: null, error: "Não autorizado" };

  let dateFilter: { gte: Date } | undefined = undefined;
  const now = new Date();
  if (period === "week") {
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    dateFilter = { gte: start };
  } else if (period === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    dateFilter = { gte: start };
  } else if (period === "quarter") {
    const quarter = Math.floor(now.getMonth() / 3);
    const start = new Date(now.getFullYear(), quarter * 3, 1);
    dateFilter = { gte: start };
  }

  try {
    const [results, goals] = await Promise.all([
      prisma.result.findMany({
        where: {
          companyId: dbUser.companyId,
          status: "approved",
          active: true,
          ...(dateFilter ? { createdAt: dateFilter } : {}),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              jobTitle: true,
            },
          },
        },
      }),
      prisma.goal.findMany({
        where: {
          companyId: dbUser.companyId,
          active: true,
          ...(dateFilter ? { startDate: dateFilter } : {}),
        },
        include: { results: { where: { status: "approved", active: true } } },
      }),
    ]);

    const userMap: Record<
      string,
      {
        userId: string;
        name: string;
        email: string;
        avatarUrl: string | null;
        jobTitle: string | null;
        totalValue: number;
        approvedCount: number;
      }
    > = {};

    for (const r of results) {
      const uid = r.user.id.toString();
      if (!userMap[uid]) {
        userMap[uid] = {
          userId: uid,
          name: r.user.name,
          email: r.user.email,
          avatarUrl: r.user.avatarUrl,
          jobTitle: r.user.jobTitle,
          totalValue: 0,
          approvedCount: 0,
        };
      }
      userMap[uid].totalValue += Number(r.value);
      userMap[uid].approvedCount += 1;
    }

    const userProgressMap: Record<string, { count: number; totalPct: number }> =
      {};
    for (const goal of goals) {
      const uid = goal.userId?.toString();
      if (!uid) continue;
      const achieved = goal.results.reduce(
        (acc, r) => acc + Number(r.value),
        0,
      );
      const target = Number(goal.targetValue);
      const pct = target > 0 ? Math.min(100, (achieved / target) * 100) : 0;
      if (!userProgressMap[uid])
        userProgressMap[uid] = { count: 0, totalPct: 0 };
      userProgressMap[uid].count += 1;
      userProgressMap[uid].totalPct += pct;
    }

    const ranking: RankingEntry[] = Object.values(userMap)
      .sort((a, b) => b.totalValue - a.totalValue)
      .map((entry, idx) => {
        const prog = userProgressMap[entry.userId];
        return {
          ...entry,
          position: idx + 1,
          goalCount: prog?.count ?? 0,
          avgProgress: prog ? Math.round(prog.totalPct / prog.count) : 0,
        };
      });

    return { data: ranking, error: null };
  } catch (e) {
    console.error("getRankingAction error:", e);
    return { data: null, error: "Erro ao buscar ranking" };
  }
}

// ================================================================
// HELPERS
// ================================================================

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "");
}
