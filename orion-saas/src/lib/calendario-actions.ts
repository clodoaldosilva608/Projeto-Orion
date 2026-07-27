"use server";

/**
 * P9 — Calendário Comercial server actions.
 *
 * Per docs/16_Roadmap.md v2.0 Q2 2026:
 *   "Calendário Comercial — Datas comemorativas, feriados, eventos"
 *
 * Features:
 *   - CRUD de eventos (criar, listar, atualizar, excluir)
 *   - Tipos: holiday, commemorative, campaign_deadline, company_event,
 *            meeting, training, other
 *   - Escopos: company, branch, team, personal
 *   - Eventos oficiais (feriados nacionais) seedados automaticamente
 *   - Visualização por mês com filtros por tipo e escopo
 *   - Integração com Campanhas: endDate das campanhas ativas aparece
 *     automaticamente como campaign_deadline
 */
import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import { createSupabaseServerClient } from "./supabase";
import { logAudit } from "./audit";
import {
  getEventColor,
  BRAZILIAN_HOLIDAYS_2026,
  BRAZILIAN_COMMEMORATIVE_2026,
} from "./calendario-helpers";

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

// Brazilian holidays + commemorative dates are imported from
// calendario-helpers.ts (non-action file).

// ================================================================
// SEED OFFICIAL HOLIDAYS — called on first access
// ================================================================

export async function seedOfficialHolidaysAction() {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    // Check if already seeded for this company
    const existing = await prisma.calendarEvent.count({
      where: { companyId: user.companyId, isOfficial: true },
    });
    if (existing > 0) {
      return { data: { seeded: 0, message: "Already seeded" }, error: null };
    }

    const allOfficial = [
      ...BRAZILIAN_HOLIDAYS_2026,
      ...BRAZILIAN_COMMEMORATIVE_2026,
    ];

    let seeded = 0;
    for (const h of allOfficial) {
      await prisma.calendarEvent.create({
        data: {
          companyId: user.companyId,
          title: h.title,
          type: h.type,
          scope: "company",
          startDate: new Date(`${h.date}T00:00:00-03:00`),
          endDate: new Date(`${h.date}T23:59:59-03:00`),
          allDay: true,
          color: getEventColor(h.type),
          isOfficial: true,
          isRecurring: true,
          recurrence: "yearly",
          createdBy: user.id,
        },
      });
      seeded++;
    }

    return { data: { seeded, message: `${seeded} feriados oficiais carregados` }, error: null };
  } catch (e) {
    console.error("seedOfficialHolidaysAction error:", e);
    return { data: null, error: (e as Error).message };
  }
}

// ================================================================
// LIST EVENTS — by month
// ================================================================

export async function listCalendarEventsAction(params: {
  year: number;
  month: number; // 1-12
  type?: string;
  scope?: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    // First, ensure official holidays are seeded
    await seedOfficialHolidaysAction();

    const startDate = new Date(params.year, params.month - 1, 1, -3, 0, 0);
    const endDate = new Date(params.year, params.month, 0, 23, 59, 59, 999);

    const where: any = {
      companyId: user.companyId,
      deletedAt: null,
      startDate: { lte: endDate },
      OR: [
        { endDate: null },
        { endDate: { gte: startDate } },
      ],
    };
    if (params.type && params.type !== "all") where.type = params.type;
    if (params.scope && params.scope !== "all") where.scope = params.scope;

    const events = await prisma.calendarEvent.findMany({
      where,
      orderBy: { startDate: "asc" },
    });

    // Also include campaign deadlines (from active campaigns in this period)
    const campaigns = await prisma.campaign.findMany({
      where: {
        companyId: user.companyId,
        deletedAt: null,
        status: { in: ["active", "scheduled"] },
        endDate: { gte: startDate, lte: endDate },
      },
      select: { id: true, name: true, endDate: true, status: true },
    });

    const campaignEvents = campaigns.map((c) => ({
      id: `campaign_${c.id.toString()}`,
      uuid: null,
      title: `📋 ${c.name}`,
      description: `Encerramento da campanha (${c.status === "active" ? "ativa" : "agendada"})`,
      type: "campaign_deadline",
      scope: "company",
      startDate: c.endDate.toISOString(),
      endDate: c.endDate.toISOString(),
      allDay: true,
      color: getEventColor("campaign_deadline"),
      isOfficial: false,
      location: null,
      isRecurring: false,
      recurrence: null,
      metadata: { campaignId: c.id.toString(), source: "campaign" },
      createdAt: new Date().toISOString(),
      isCampaign: true,
    }));

    const eventList = [
      ...events.map((e) => ({
        ...e,
        id: e.id.toString(),
        companyId: e.companyId.toString(),
        branchId: e.branchId?.toString() ?? null,
        userId: e.userId?.toString() ?? null,
        startDate: e.startDate.toISOString(),
        endDate: e.endDate?.toISOString() ?? null,
        createdAt: e.createdAt.toISOString(),
        isCampaign: false,
      })),
      ...campaignEvents,
    ];

    // Sort by start date
    eventList.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    return { data: eventList, error: null };
  } catch (e) {
    console.error("listCalendarEventsAction error:", e);
    return { data: null, error: (e as Error).message };
  }
}

// ================================================================
// CRUD
// ================================================================

export async function createCalendarEventAction(data: {
  title: string;
  description?: string;
  type: "holiday" | "commemorative" | "campaign_deadline" | "company_event" | "meeting" | "training" | "other";
  scope?: "company" | "branch" | "team" | "personal";
  startDate: string; // ISO date
  endDate?: string;
  allDay?: boolean;
  location?: string;
  color?: string;
  branchId?: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const start = new Date(data.startDate);
    if (isNaN(start.getTime())) {
      return { data: null, error: "Data de início inválida" };
    }
    let end: Date | null = null;
    if (data.endDate) {
      end = new Date(data.endDate);
      if (isNaN(end.getTime())) end = null;
    }
    if (!end) end = start;

    const event = await prisma.calendarEvent.create({
      data: {
        companyId: user.companyId,
        branchId: data.branchId ? BigInt(data.branchId) : null,
        userId: data.scope === "personal" ? user.id : null,
        title: data.title,
        description: data.description ?? null,
        type: data.type as any,
        scope: (data.scope ?? "company") as any,
        startDate: start,
        endDate: end,
        allDay: data.allDay ?? true,
        location: data.location ?? null,
        color: data.color ?? getEventColor(data.type),
        isOfficial: false,
        createdBy: user.id,
      },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "create",
      tableName: "calendar_events",
      recordId: event.id,
      newValue: { title: event.title, type: event.type, startDate: start },
    });

    revalidatePath("/calendario");
    return { data: { id: event.id.toString() }, error: null };
  } catch (e) {
    console.error("createCalendarEventAction error:", e);
    return { data: null, error: (e as Error).message };
  }
}

export async function deleteCalendarEventAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    // Official holidays can't be deleted (only soft-deleted)
    await prisma.calendarEvent.updateMany({
      where: { id: BigInt(id), companyId: user.companyId, deletedAt: null },
      data: { deletedAt: new Date(), updatedBy: user.id },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "delete",
      tableName: "calendar_events",
      recordId: BigInt(id),
    });

    revalidatePath("/calendario");
    return { data: { ok: true }, error: null };
  } catch (e) {
    console.error("deleteCalendarEventAction error:", e);
    return { data: null, error: (e as Error).message };
  }
}

// ================================================================
// STATS — for the dashboard cards
// ================================================================

export async function getCalendarStatsAction(year: number, month: number) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const startDate = new Date(year, month - 1, 1, -3, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const where = {
      companyId: user.companyId,
      deletedAt: null,
      startDate: { lte: endDate },
      OR: [{ endDate: null }, { endDate: { gte: startDate } }],
    };

    const [byType, totalCount, officialCount, customCount] = await Promise.all([
      prisma.calendarEvent.groupBy({
        by: ["type"],
        where,
        _count: true,
      }),
      prisma.calendarEvent.count({ where }),
      prisma.calendarEvent.count({ where: { ...where, isOfficial: true } }),
      prisma.calendarEvent.count({ where: { ...where, isOfficial: false } }),
    ]);

    const typeCounts: Record<string, number> = {};
    for (const t of byType) {
      typeCounts[t.type] = t._count;
    }

    return {
      data: {
        total: totalCount,
        official: officialCount,
        custom: customCount,
        byType: typeCounts,
      },
      error: null,
    };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}
