"use server";

/**
 * P12 — Checklist Diário server actions.
 *
 * Per docs/16_Roadmap.md v2.0 Q4 2026:
 *   "Checklist Diário — Para vendedores (tarefas do dia) (40 SP)"
 *
 * Features:
 *   - Templates: admin creates reusable checklist templates with items
 *   - Auto-generation: each day, system creates task instances from
 *     templates for each user (matching scope + weekday)
 *   - Mark task as done/skipped
 *   - Progress tracking (X/Y completed today)
 *   - Integration with Gamificação: completing a task awards points
 *     (default 10 per task, configurable per item)
 *
 * Models:
 *   - ChecklistTemplate: definition (scope, weekdays, start/end time)
 *   - ChecklistItem: tasks within a template (title, points, required)
 *   - ChecklistTask: daily instances for each user
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
    include: { role: true },
  });
  if (!dbUser) return null;
  return dbUser;
}

function todayDate(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

function getWeekday(): number {
  // ISO weekday: 1=Mon ... 7=Sun
  const day = new Date().getDay(); // 0=Sun ... 6=Sat
  return day === 0 ? 7 : day;
}

// ================================================================
// TEMPLATES — CRUD
// ================================================================

export async function listTemplatesAction() {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const templates = await prisma.checklistTemplate.findMany({
      where: { companyId: user.companyId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { items: true } },
      },
    });

    return {
      data: templates.map((t) => ({
        ...t,
        id: t.id.toString(),
        companyId: t.companyId.toString(),
        roleId: t.roleId?.toString() ?? null,
        branchId: t.branchId?.toString() ?? null,
        createdAt: t.createdAt.toISOString(),
        itemsCount: t._count.items,
      })),
      error: null,
    };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function getTemplateAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const template = await prisma.checklistTemplate.findFirst({
      where: { id: BigInt(id), companyId: user.companyId, deletedAt: null },
      include: {
        items: {
          where: { deletedAt: null },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
    if (!template) return { data: null, error: "Template não encontrado" };

    return {
      data: {
        ...template,
        id: template.id.toString(),
        companyId: template.companyId.toString(),
        items: template.items.map((i) => ({
          ...i,
          id: i.id.toString(),
          templateId: i.templateId.toString(),
        })),
      },
      error: null,
    };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function createTemplateAction(data: {
  name: string;
  description?: string;
  scope?: "personal" | "role" | "team" | "company";
  startsAt?: string;
  endsAt?: string;
  weekdays?: string;
  items: Array<{
    title: string;
    description?: string;
    points?: number;
    isRequired?: boolean;
    estimatedMin?: number;
  }>;
}) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    if (!data.name?.trim()) return { data: null, error: "Nome é obrigatório" };
    if (!data.items || data.items.length === 0) {
      return { data: null, error: "Adicione pelo menos 1 item" };
    }

    const template = await prisma.checklistTemplate.create({
      data: {
        companyId: user.companyId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        scope: (data.scope ?? "personal") as any,
        startsAt: data.startsAt ?? "09:00",
        endsAt: data.endsAt ?? "18:00",
        weekdays: data.weekdays ?? "1,2,3,4,5",
        createdBy: user.id,
        items: {
          create: data.items.map((item, idx) => ({
            title: item.title.trim(),
            description: item.description?.trim() || null,
            sortOrder: idx,
            points: item.points ?? 10,
            isRequired: item.isRequired ?? true,
            estimatedMin: item.estimatedMin ?? null,
          })),
        },
      },
      include: { items: true },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "create",
      tableName: "checklist_templates",
      recordId: template.id,
      newValue: { name: template.name, itemsCount: template.items.length },
    });

    revalidatePath("/checklist/modelos");
    return { data: { id: template.id.toString() }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function deleteTemplateAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    await prisma.checklistTemplate.updateMany({
      where: { id: BigInt(id), companyId: user.companyId, deletedAt: null },
      data: { deletedAt: new Date(), isActive: false },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "delete",
      tableName: "checklist_templates",
      recordId: BigInt(id),
    });

    revalidatePath("/checklist/modelos");
    return { data: { ok: true }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

// ================================================================
// DAILY GENERATION — auto-create tasks for today
// ================================================================

async function generateDailyTasksForUser(userId: bigint, companyId: bigint) {
  const today = todayDate();
  const weekday = getWeekday();

  // Find templates that apply to this user
  // (for now: all company-scope templates + personal-scope ones created
  // by this user — we don't filter by role/branch yet for simplicity)
  const templates = await prisma.checklistTemplate.findMany({
    where: {
      companyId,
      isActive: true,
      deletedAt: null,
    },
    include: {
      items: {
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  // Filter by weekday
  const applicable = templates.filter((t) => {
    const days = t.weekdays.split(",").map((d) => parseInt(d.trim(), 10));
    return days.includes(weekday);
  });

  // Check which tasks already exist for today (idempotent)
  const existing = await prisma.checklistTask.findMany({
    where: { userId, date: today },
    select: { itemId: true },
  });
  const existingItemIds = new Set(existing.map((e) => e.itemId));

  let created = 0;
  for (const template of applicable) {
    for (const item of template.items) {
      if (existingItemIds.has(item.id)) continue;
      try {
        await prisma.checklistTask.create({
          data: {
            companyId,
            templateId: template.id,
            itemId: item.id,
            userId,
            date: today,
            status: "pending",
          },
        });
        created++;
      } catch {
        // Race condition or unique constraint — skip
      }
    }
  }

  return created;
}

// ================================================================
// TODAY'S CHECKLIST — list + complete + skip
// ================================================================

export async function getTodayChecklistAction() {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    // Auto-generate tasks for today (idempotent)
    await generateDailyTasksForUser(user.id, user.companyId);

    const today = todayDate();
    const tasks = await prisma.checklistTask.findMany({
      where: { userId: user.id, date: today },
      orderBy: [{ itemId: "asc" }],
      include: {
        item: true,
        template: { select: { name: true, startsAt: true, endsAt: true } },
      },
    });

    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const skipped = tasks.filter((t) => t.status === "skipped").length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    const totalPoints = tasks
      .filter((t) => t.status === "done")
      .reduce((acc, t) => acc + (t.item?.points ?? 0), 0);
    const possiblePoints = tasks.reduce((acc, t) => acc + (t.item?.points ?? 0), 0);
    const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;

    return {
      data: {
        date: today.toISOString(),
        tasks: tasks.map((t) => ({
          ...t,
          id: t.id.toString(),
          companyId: t.companyId.toString(),
          templateId: t.templateId.toString(),
          itemId: t.itemId.toString(),
          userId: t.userId.toString(),
          date: t.date.toISOString(),
          completedAt: t.completedAt?.toISOString() ?? null,
          item: t.item
            ? {
                ...t.item,
                id: t.item.id.toString(),
                templateId: t.item.templateId.toString(),
              }
            : null,
          template: t.template
            ? { name: t.template.name, startsAt: t.template.startsAt, endsAt: t.template.endsAt }
            : null,
        })),
        stats: {
          total,
          done,
          skipped,
          pending,
          totalPoints,
          possiblePoints,
          progressPct,
        },
      },
      error: null,
    };
  } catch (e) {
    console.error("getTodayChecklistAction error:", e);
    return { data: null, error: (e as Error).message };
  }
}

export async function completeTaskAction(taskId: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const task = await prisma.checklistTask.update({
      where: {
        id: BigInt(taskId),
        companyId: user.companyId,
        userId: user.id,
      },
      data: {
        status: "done",
        completedAt: new Date(),
      },
      include: { item: true },
    });

    // Award points via gamificação
    if (task.item && task.item.points > 0) {
      try {
        const { awardPointsAction } = await import("./gamification-actions");
        await awardPointsAction({
          userId: user.id,
          reasonKey: "result_on_time", // reuse: 10 points for completing
          points: task.item.points,
          referenceId: task.id.toString(),
          metadata: {
            type: "checklist_task_completed",
            itemId: task.item.id.toString(),
            itemTitle: task.item.title,
          },
        });
      } catch {}
    }

    revalidatePath("/checklist");
    return { data: { ok: true, points: task.item?.points ?? 0 }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function uncompleteTaskAction(taskId: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const task = await prisma.checklistTask.update({
      where: {
        id: BigInt(taskId),
        companyId: user.companyId,
        userId: user.id,
      },
      data: {
        status: "pending",
        completedAt: null,
      },
    });

    revalidatePath("/checklist");
    return { data: { ok: true }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function skipTaskAction(taskId: string, notes?: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    await prisma.checklistTask.update({
      where: {
        id: BigInt(taskId),
        companyId: user.companyId,
        userId: user.id,
      },
      data: {
        status: "skipped",
        notes: notes ?? null,
      },
    });

    revalidatePath("/checklist");
    return { data: { ok: true }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

// ================================================================
// HISTORY — past days
// ================================================================

export async function getChecklistHistoryAction(days = 7) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const today = todayDate();
    const startDate = new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000);

    const tasks = await prisma.checklistTask.findMany({
      where: {
        userId: user.id,
        date: { gte: startDate, lte: today },
      },
      orderBy: [{ date: "desc" }, { itemId: "asc" }],
      include: { item: true },
    });

    // Group by date
    const byDate = new Map<string, { total: number; done: number; points: number }>();
    for (const t of tasks) {
      const key = t.date.toISOString().slice(0, 10);
      if (!byDate.has(key)) byDate.set(key, { total: 0, done: 0, points: 0 });
      const entry = byDate.get(key)!;
      entry.total++;
      if (t.status === "done") {
        entry.done++;
        entry.points += t.item?.points ?? 0;
      }
    }

    return {
      data: Array.from(byDate.entries()).map(([date, stats]) => ({
        date,
        total: stats.total,
        done: stats.done,
        points: stats.points,
        progressPct: stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0,
      })),
      error: null,
    };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}
