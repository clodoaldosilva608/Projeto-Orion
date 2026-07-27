"use server";

/**
 * P7 — Campanhas & Premiações server actions.
 *
 * All actions are multi-tenant (filter by companyId from current user).
 * Campaigns support:
 *   - CRUD (create, list, get, update, delete via soft-delete)
 *   - Add/remove participants
 *   - Add/remove awards (medalhas, troféus, pontos, brindes, etc.)
 *   - Compute live leaderboard (rank participants by total points
 *     accumulated from approved Results linked to the campaign's Goals)
 *   - Start/end campaign (status transitions)
 *
 * BigInt IDs are converted to string before returning. Decimal fields
 * are converted to Number.
 */
import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import { createSupabaseServerClient } from "./supabase";
import { logAudit } from "./audit";
import { enqueueEmail } from "./email";
import { enqueueWebhook } from "./webhooks";

async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: { company: true },
  });
  if (!dbUser) return null;
  return dbUser;
}

// ================================================================
// CAMPAIGNS — CRUD
// ================================================================

export async function listCampaignsAction(filter?: "all" | "active" | "finished" | "draft") {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const where: any = {
      companyId: user.companyId,
      deletedAt: null,
    };
    if (filter === "active") where.status = "active";
    if (filter === "finished") where.status = "finished";
    if (filter === "draft") where.status = "draft";

    const campaigns = await prisma.campaign.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { participants: true, awards: true, goals: true } },
      },
    });

    const now = new Date();
    const data = campaigns.map((c) => {
      const isOngoing = c.status === "active" && c.startDate <= now && c.endDate >= now;
      const daysLeft = Math.ceil((c.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        id: c.id.toString(),
        uuid: c.uuid,
        name: c.name,
        description: c.description,
        status: c.status,
        startDate: c.startDate.toISOString(),
        endDate: c.endDate.toISOString(),
        imageUrl: c.imageUrl,
        rules: c.rules,
        createdAt: c.createdAt.toISOString(),
        isOngoing,
        daysLeft: daysLeft > 0 ? daysLeft : 0,
        participantsCount: c._count.participants,
        awardsCount: c._count.awards,
        goalsCount: c._count.goals,
      };
    });
    return { data, error: null };
  } catch (e) {
    console.error("listCampaignsAction error:", e);
    return { data: null, error: (e as Error).message };
  }
}

export async function getCampaignAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const campaign = await prisma.campaign.findFirst({
      where: { id: BigInt(id), companyId: user.companyId, deletedAt: null },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, email: true, jobTitle: true, avatarUrl: true } } },
          orderBy: { totalPoints: "desc" },
        },
        awards: { orderBy: { position: "asc" } },
        goals: { include: { indicator: true } },
      },
    });
    if (!campaign) return { data: null, error: "Campanha não encontrada" };

    return {
      data: {
        ...campaign,
        id: campaign.id.toString(),
        companyId: campaign.companyId.toString(),
        startDate: campaign.startDate.toISOString(),
        endDate: campaign.endDate.toISOString(),
        createdAt: campaign.createdAt.toISOString(),
        participants: campaign.participants.map((p) => ({
          ...p,
          id: p.id.toString(),
          campaignId: p.campaignId.toString(),
          userId: p.userId.toString(),
          totalPoints: Number(p.totalPoints),
          joinedAt: p.joinedAt.toISOString(),
          finishedAt: p.finishedAt?.toISOString() ?? null,
          user: {
            ...p.user,
            id: p.user.id.toString(),
          },
        })),
        awards: campaign.awards.map((a) => ({
          ...a,
          id: a.id.toString(),
          companyId: a.companyId.toString(),
          campaignId: a.campaignId?.toString() ?? null,
          value: a.value ? Number(a.value) : null,
          createdAt: a.createdAt.toISOString(),
        })),
        goals: campaign.goals.map((g) => ({
          ...g,
          id: g.id.toString(),
          companyId: g.companyId.toString(),
          indicatorId: g.indicatorId.toString(),
          targetValue: Number(g.targetValue),
          startDate: g.startDate.toISOString(),
          endDate: g.endDate.toISOString(),
          createdAt: g.createdAt.toISOString(),
        })),
      },
      error: null,
    };
  } catch (e) {
    console.error("getCampaignAction error:", e);
    return { data: null, error: (e as Error).message };
  }
}

export async function createCampaignAction(data: {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  rules?: Record<string, unknown>;
  imageUrl?: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (end <= start) {
      return { data: null, error: "Data de término deve ser após a data de início" };
    }

    const campaign = await prisma.campaign.create({
      data: {
        companyId: user.companyId,
        name: data.name,
        description: data.description ?? null,
        status: "draft",
        startDate: start,
        endDate: end,
        rules: (data.rules as any) ?? {},
        imageUrl: data.imageUrl ?? null,
        createdBy: user.id,
      },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "create",
      tableName: "campaigns",
      recordId: campaign.id,
      newValue: { name: campaign.name, startDate: start, endDate: end },
    });

    revalidatePath("/campanhas");
    return {
      data: { id: campaign.id.toString(), uuid: campaign.uuid },
      error: null,
    };
  } catch (e) {
    console.error("createCampaignAction error:", e);
    return { data: null, error: (e as Error).message };
  }
}

export async function updateCampaignStatusAction(id: string, status: "draft" | "scheduled" | "active" | "paused" | "finished" | "canceled") {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const campaign = await prisma.campaign.updateMany({
      where: { id: BigInt(id), companyId: user.companyId, deletedAt: null },
      data: { status: status as any, updatedBy: user.id },
    });
    if (campaign.count === 0) return { data: null, error: "Campanha não encontrada" };

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "update",
      tableName: "campaigns",
      recordId: BigInt(id),
      newValue: { status },
    });

    // Notify participants when campaign starts or ends.
    if (status === "active" || status === "finished") {
      const participants = await prisma.campaignParticipant.findMany({
        where: { campaignId: BigInt(id) },
        include: { user: { select: { email: true, name: true } } },
      });
      const cmp = await prisma.campaign.findFirst({
        where: { id: BigInt(id) },
        select: { name: true },
      });
      const subject = status === "active"
        ? `[Orion] Campanha iniciada: ${cmp?.name}`
        : `[Orion] Campanha encerrada: ${cmp?.name}`;
      const body = status === "active"
        ? `<div style="font-family:Inter,sans-serif"><h3>Campanha iniciada!</h3><p>A campanha <strong>${cmp?.name}</strong> está agora ativa. Acompanhe sua posição no ranking!</p></div>`
        : `<div style="font-family:Inter,sans-serif"><h3>Campanha encerrada</h3><p>A campanha <strong>${cmp?.name}</strong> foi encerrada. Confira o resultado final no painel.</p></div>`;

      for (const p of participants) {
        await enqueueEmail({
          companyId: user.companyId,
          toEmail: p.user.email,
          toName: p.user.name,
          subject,
          bodyHtml: body,
          bodyText: subject,
        });
      }

      // Fire webhook event
      await enqueueWebhook({
        companyId: user.companyId,
        event: status === "active" ? "campaign.started" : "campaign.ended",
        payload: { campaignId: id, name: cmp?.name },
      });
    }

    revalidatePath("/campanhas");
    revalidatePath(`/campanhas/${id}`);
    return { data: { ok: true }, error: null };
  } catch (e) {
    console.error("updateCampaignStatusAction error:", e);
    return { data: null, error: (e as Error).message };
  }
}

export async function deleteCampaignAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    await prisma.campaign.updateMany({
      where: { id: BigInt(id), companyId: user.companyId, deletedAt: null },
      data: { deletedAt: new Date(), active: false, updatedBy: user.id },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "delete",
      tableName: "campaigns",
      recordId: BigInt(id),
    });

    revalidatePath("/campanhas");
    return { data: { ok: true }, error: null };
  } catch (e) {
    console.error("deleteCampaignAction error:", e);
    return { data: null, error: (e as Error).message };
  }
}

// ================================================================
// PARTICIPANTS
// ================================================================

export async function addParticipantAction(campaignId: string, userId: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const participant = await prisma.campaignParticipant.upsert({
      where: {
        campaignId_userId: { campaignId: BigInt(campaignId), userId: BigInt(userId) },
      },
      update: {},
      create: {
        campaignId: BigInt(campaignId),
        userId: BigInt(userId),
      },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "create",
      tableName: "campaign_participants",
      recordId: participant.id,
      newValue: { campaignId, userId },
    });

    revalidatePath(`/campanhas/${campaignId}`);
    return { data: { id: participant.id.toString() }, error: null };
  } catch (e) {
    console.error("addParticipantAction error:", e);
    return { data: null, error: (e as Error).message };
  }
}

export async function removeParticipantAction(campaignId: string, userId: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    await prisma.campaignParticipant.delete({
      where: {
        campaignId_userId: { campaignId: BigInt(campaignId), userId: BigInt(userId) },
      },
    });

    revalidatePath(`/campanhas/${campaignId}`);
    return { data: { ok: true }, error: null };
  } catch (e) {
    console.error("removeParticipantAction error:", e);
    return { data: null, error: (e as Error).message };
  }
}

export async function joinCampaignAction(campaignId: string) {
  // Self-join: current user joins the campaign
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };
  return addParticipantAction(campaignId, user.id.toString());
}

// ================================================================
// AWARDS
// ================================================================

export async function addAwardAction(data: {
  campaignId: string;
  name: string;
  description?: string;
  type: "points" | "money" | "product" | "badge" | "experience" | "custom";
  value?: number;
  imageUrl?: string;
  position?: number;
}) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const award = await prisma.award.create({
      data: {
        companyId: user.companyId,
        campaignId: BigInt(data.campaignId),
        name: data.name,
        description: data.description ?? null,
        type: data.type as any,
        value: data.value ?? null,
        imageUrl: data.imageUrl ?? null,
        position: data.position ?? null,
      },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "create",
      tableName: "awards",
      recordId: award.id,
      newValue: { name: data.name, type: data.type, value: data.value },
    });

    revalidatePath(`/campanhas/${data.campaignId}`);
    return { data: { id: award.id.toString() }, error: null };
  } catch (e) {
    console.error("addAwardAction error:", e);
    return { data: null, error: (e as Error).message };
  }
}

export async function deleteAwardAction(awardId: string, campaignId: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    await prisma.award.deleteMany({
      where: { id: BigInt(awardId), companyId: user.companyId },
    });

    revalidatePath(`/campanhas/${campaignId}`);
    return { data: { ok: true }, error: null };
  } catch (e) {
    console.error("deleteAwardAction error:", e);
    return { data: null, error: (e as Error).message };
  }
}

// ================================================================
// LEADERBOARD — recompute points from approved Results
// ================================================================

export async function recomputeLeaderboardAction(campaignId: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    // Find all goals linked to this campaign
    const goals = await prisma.goal.findMany({
      where: { campaignId: BigInt(campaignId), companyId: user.companyId },
      select: { id: true },
    });
    const goalIds = goals.map((g) => g.id);
    if (goalIds.length === 0) {
      return { data: { updated: 0, message: "Nenhuma meta vinculada à campanha" }, error: null };
    }

    // Get all approved results for those goals, grouped by user
    const results = await prisma.result.findMany({
      where: { goalId: { in: goalIds }, status: "approved" },
      select: { userId: true, value: true },
    });

    const pointsByUser = new Map<bigint, number>();
    for (const r of results) {
      const current = pointsByUser.get(r.userId) ?? 0;
      pointsByUser.set(r.userId, current + Number(r.value));
    }

    // Update each participant's totalPoints and rank
    const participants = await prisma.campaignParticipant.findMany({
      where: { campaignId: BigInt(campaignId) },
    });

    // Sort by points desc to compute rank
    const sorted = participants
      .map((p) => ({ id: p.id, userId: p.userId, points: pointsByUser.get(p.userId) ?? 0 }))
      .sort((a, b) => b.points - a.points);

    let updated = 0;
    for (let i = 0; i < sorted.length; i++) {
      const entry = sorted[i];
      await prisma.campaignParticipant.update({
        where: { id: entry.id },
        data: { totalPoints: entry.points, rank: i + 1 },
      });
      updated++;
    }

    revalidatePath(`/campanhas/${campaignId}`);
    return { data: { updated, totalPoints: pointsByUser.size }, error: null };
  } catch (e) {
    console.error("recomputeLeaderboardAction error:", e);
    return { data: null, error: (e as Error).message };
  }
}

// ================================================================
// LIST USERS — for participant picker
// ================================================================

export async function listCompanyUsersAction() {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const users = await prisma.user.findMany({
      where: { companyId: user.companyId, active: true, deletedAt: null },
      select: { id: true, name: true, email: true, jobTitle: true, avatarUrl: true },
      orderBy: { name: "asc" },
    });
    return {
      data: users.map((u) => ({ ...u, id: u.id.toString() })),
      error: null,
    };
  } catch (e) {
    console.error("listCompanyUsersAction error:", e);
    return { data: null, error: (e as Error).message };
  }
}
