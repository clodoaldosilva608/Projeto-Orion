"use server";

/**
 * P8 — Gamificação server actions.
 *
 * Implements rules RN-159 to RN-166 from docs/07_Business_Rules_Document.md.
 *
 * - awardPointsAction: credencia pontos a um usuário (com reason_key)
 * - checkAndUnlockAchievementsAction: verifica conquistas automaticamente
 * - getUserProfileAction: retorna perfil completo (pontos, nível, conquistas)
 * - getCompanyLeaderboardAction: ranking de pontos (mensal ou total)
 * - redeemPointsAction: troca pontos por prêmio
 * - listRedemptionsAction / approveRedemptionAction / rejectRedemptionAction
 * - getGamificationSettingsAction / saveGamificationSettingsAction
 */
import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import { createSupabaseServerClient } from "./supabase";
import { logAudit } from "./audit";
import { enqueueEmail } from "./email";
import {
  LEVELS,
  getLevelForPoints,
  getLevelProgress,
  DEFAULT_POINT_RULES,
  ACHIEVEMENTS,
  DEFAULT_REWARDS,
  getAchievementByKey,
  type Achievement,
} from "./gamification";

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

// ================================================================
// POINTS — RN-159
// ================================================================

export async function awardPointsAction(params: {
  userId: bigint | string;
  reasonKey: string;
  points?: number; // optional override; if omitted, uses DEFAULT_POINT_RULES
  referenceId?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ data: { awarded: number; newTotal: number } | null; error: string | null }> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { data: null, error: "Não autorizado" };

  try {
    const targetUserId = typeof params.userId === "string" ? BigInt(params.userId) : params.userId;
    // Self-award allowed (e.g., user submits their own result)
    if (targetUserId !== currentUser.id) {
      // Verify same company
      const target = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { companyId: true },
      });
      if (!target || target.companyId !== currentUser.companyId) {
        return { data: null, error: "Usuário não encontrado na mesma empresa" };
      }
    }

    const rule = DEFAULT_POINT_RULES.find((r) => r.key === params.reasonKey);
    const points = params.points ?? rule?.points ?? 0;
    if (points === 0) return { data: { awarded: 0, newTotal: 0 }, error: null };

    // Create transaction
    const tx = await prisma.pointTransaction.create({
      data: {
        companyId: currentUser.companyId,
        userId: targetUserId,
        type: points > 0 ? "earned" : "penalty",
        points,
        reason: rule?.label ?? params.reasonKey,
        reasonKey: params.reasonKey,
        referenceId: params.referenceId ?? null,
        metadata: (params.metadata as any) ?? {},
      },
    });

    // Compute new total
    const allTx = await prisma.pointTransaction.aggregate({
      where: { userId: targetUserId },
      _sum: { points: true },
    });
    const newTotal = allTx._sum.points ?? 0;

    // Auto-check achievements (best-effort, non-blocking)
    checkAndUnlockAchievements(targetUserId, currentUser.companyId).catch(() => {});

    return {
      data: { awarded: points, newTotal },
      error: null,
    };
  } catch (e) {
    console.error("awardPointsAction error:", e);
    return { data: null, error: (e as Error).message };
  }
}

// ================================================================
// ACHIEVEMENTS — RN-162
// ================================================================

async function checkAndUnlockAchievements(userId: bigint, companyId: bigint) {
  // Compute stats
  const [
    approvedResultsCount,
    campaignWinsCount,
    distinctClientsCount,
    streakDays,
  ] = await Promise.all([
    prisma.result.count({ where: { userId, status: "approved" } }),
    // Campaign wins = campaign_participants where rank = 1
    prisma.campaignParticipant.count({ where: { userId, rank: 1 } }),
    // Distinct clients created by user (if applicable)
    Promise.resolve(0), // placeholder — clients module not implemented
    // Streak: distinct days with results in last 90 days
    computeStreakDays(userId),
  ]);

  const unlocks: string[] = [];
  const checks: { key: string; condition: boolean }[] = [
    { key: "streak_7", condition: streakDays >= 7 },
    { key: "streak_30", condition: streakDays >= 30 },
    { key: "streak_90", condition: streakDays >= 90 },
    { key: "goal_10", condition: approvedResultsCount >= 10 },
    { key: "goal_50", condition: approvedResultsCount >= 50 },
    { key: "goal_100", condition: approvedResultsCount >= 100 },
    { key: "first_goal", condition: approvedResultsCount >= 1 },
    { key: "first_campaign_win", condition: campaignWinsCount >= 1 },
    { key: "client_1", condition: distinctClientsCount >= 1 },
    { key: "client_10", condition: distinctClientsCount >= 10 },
    { key: "client_100", condition: distinctClientsCount >= 100 },
  ];

  for (const { key, condition } of checks) {
    if (!condition) continue;
    const ach = getAchievementByKey(key);
    if (!ach) continue;
    // Try to create — unique constraint will skip if already unlocked
    try {
      await prisma.userAchievement.create({
        data: {
          companyId,
          userId,
          achievementKey: key,
          category: ach.category as any,
          metadata: {
            unlockedBy: "auto",
            stats: { approvedResultsCount, campaignWinsCount, streakDays },
          },
        },
      });
      unlocks.push(key);
    } catch {
      // Already unlocked — skip
    }
  }

  // Notify user of newly unlocked achievements
  if (unlocks.length > 0) {
    for (const key of unlocks) {
      const ach = getAchievementByKey(key);
      if (!ach) continue;
      try {
        await prisma.notification.create({
          data: {
            companyId,
            userId,
            title: "Nova conquista desbloqueada!",
            body: `${ach.icon} ${ach.name} — ${ach.description}`,
            channel: "in_app",
            priority: "high",
            data: { achievementKey: key, type: "achievement_unlocked" },
          },
        });
      } catch {}

      // Enqueue email
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, name: true },
        });
        if (user) {
          await enqueueEmail({
            companyId,
            toEmail: user.email,
            toName: user.name,
            subject: `[Orion] Nova conquista: ${ach.icon} ${ach.name}`,
            bodyHtml: `<div style="font-family:Inter,sans-serif"><h3>🏆 Conquista desbloqueada!</h3><p>Parabéns, <strong>${user.name}</strong>!</p><p>Você desbloqueou a conquista <strong>${ach.icon} ${ach.name}</strong>.</p><p><em>${ach.description}</em></p></div>`,
            bodyText: `Conquista desbloqueada: ${ach.icon} ${ach.name} — ${ach.description}`,
          });
        }
      } catch {}
    }
  }

  return unlocks;
}

async function computeStreakDays(userId: bigint): Promise<number> {
  // Get distinct dates where user submitted results, ordered desc
  const results = await prisma.result.findMany({
    where: { userId, status: "approved" },
    select: { referenceDate: true },
    orderBy: { referenceDate: "desc" },
    take: 200,
  });
  if (results.length === 0) return 0;

  // Build set of date strings (YYYY-MM-DD)
  const dateSet = new Set<string>();
  for (const r of results) {
    const d = new Date(r.referenceDate);
    dateSet.add(d.toISOString().slice(0, 10));
  }

  // Walk back from today counting consecutive days
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    if (dateSet.has(key)) streak++;
    else if (i > 0) break; // allow today to be missing (day not over yet)
  }
  return streak;
}

export async function checkAndUnlockAchievementsAction() {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };
  const unlocks = await checkAndUnlockAchievements(user.id, user.companyId);
  revalidatePath("/gamificacao");
  return { data: { unlocks }, error: null };
}

// ================================================================
// PROFILE
// ================================================================

export async function getUserProfileAction(userId?: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { data: null, error: "Não autorizado" };
  const targetId = userId ? BigInt(userId) : currentUser.id;

  try {
    const target = await prisma.user.findFirst({
      where: { id: targetId, companyId: currentUser.companyId },
      select: {
        id: true, name: true, email: true, jobTitle: true, avatarUrl: true,
      },
    });
    if (!target) return { data: null, error: "Usuário não encontrado" };

    const [allTx, achievements, recentTx, recentRedemptions, campaignsJoined] = await Promise.all([
      prisma.pointTransaction.aggregate({
        where: { userId: targetId },
        _sum: { points: true },
      }),
      prisma.userAchievement.findMany({
        where: { userId: targetId },
        orderBy: { unlockedAt: "desc" },
      }),
      prisma.pointTransaction.findMany({
        where: { userId: targetId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.pointRedemption.findMany({
        where: { userId: targetId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.campaignParticipant.count({ where: { userId: targetId } }),
    ]);

    const totalPoints = allTx._sum.points ?? 0;
    const level = getLevelForPoints(totalPoints);
    const progress = getLevelProgress(totalPoints);

    // Compute monthly points
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthTx = await prisma.pointTransaction.aggregate({
      where: { userId: targetId, createdAt: { gte: monthStart } },
      _sum: { points: true },
    });

    return {
      data: {
        user: { ...target, id: target.id.toString() },
        totalPoints,
        monthlyPoints: monthTx._sum.points ?? 0,
        level,
        progress,
        achievements: achievements.map((a) => ({
          ...a,
          id: a.id.toString(),
          userId: a.userId.toString(),
          companyId: a.companyId.toString(),
          unlockedAt: a.unlockedAt.toISOString(),
          // join with achievement metadata
          meta: getAchievementByKey(a.achievementKey),
        })),
        achievementsCount: achievements.length,
        recentTransactions: recentTx.map((t) => ({
          ...t,
          id: t.id.toString(),
          userId: t.userId.toString(),
          companyId: t.companyId.toString(),
          createdAt: t.createdAt.toISOString(),
        })),
        recentRedemptions: recentRedemptions.map((r) => ({
          ...r,
          id: r.id.toString(),
          userId: r.userId.toString(),
          companyId: r.companyId.toString(),
          createdAt: r.createdAt.toISOString(),
          reviewedAt: r.reviewedAt?.toISOString() ?? null,
          fulfilledAt: r.fulfilledAt?.toISOString() ?? null,
        })),
        campaignsJoined,
      },
      error: null,
    };
  } catch (e) {
    console.error("getUserProfileAction error:", e);
    return { data: null, error: (e as Error).message };
  }
}

// ================================================================
// LEADERBOARD — RN-164
// ================================================================

export async function getCompanyLeaderboardAction(period: "month" | "all" = "month") {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const where: any = { companyId: user.companyId };
    if (period === "month") {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      where.createdAt = { gte: monthStart };
    }

    const rows = await prisma.pointTransaction.groupBy({
      by: ["userId"],
      where,
      _sum: { points: true },
      orderBy: { _sum: { points: "desc" } },
      take: 50,
    });

    if (rows.length === 0) return { data: [], error: null };

    const users = await prisma.user.findMany({
      where: { id: { in: rows.map((r) => r.userId) } },
      select: { id: true, name: true, email: true, jobTitle: true, avatarUrl: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const data = rows.map((r, idx) => {
      const u = userMap.get(r.userId);
      const points = r._sum.points ?? 0;
      return {
        position: idx + 1,
        userId: r.userId.toString(),
        name: u?.name ?? "—",
        email: u?.email ?? "",
        jobTitle: u?.jobTitle ?? null,
        avatarUrl: u?.avatarUrl ?? null,
        points,
        level: getLevelForPoints(points),
      };
    });
    return { data, error: null };
  } catch (e) {
    console.error("getCompanyLeaderboardAction error:", e);
    return { data: null, error: (e as Error).message };
  }
}

// ================================================================
// REDEMPTIONS — RN-165
// ================================================================

export async function redeemPointsAction(rewardKey: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  const reward = DEFAULT_REWARDS.find((r) => r.key === rewardKey);
  if (!reward) return { data: null, error: "Prêmio não encontrado" };

  try {
    // Check balance
    const balance = await prisma.pointTransaction.aggregate({
      where: { userId: user.id },
      _sum: { points: true },
    });
    const total = balance._sum.points ?? 0;

    // Subtract already-spent
    const spent = await prisma.pointRedemption.aggregate({
      where: { userId: user.id, status: { in: ["pending", "approved", "fulfilled"] } },
      _sum: { pointsCost: true },
    });
    const spentTotal = spent._sum.pointsCost ?? 0;
    const available = total - spentTotal;

    if (available < reward.pointsCost) {
      return { data: null, error: `Pontos insuficientes. Você tem ${available} pontos, necessário ${reward.pointsCost}.` };
    }

    const redemption = await prisma.pointRedemption.create({
      data: {
        companyId: user.companyId,
        userId: user.id,
        rewardKey,
        rewardName: reward.name,
        pointsCost: reward.pointsCost,
        status: "pending",
        metadata: { icon: reward.icon, description: reward.description },
      },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "create",
      tableName: "point_redemptions",
      recordId: redemption.id,
      newValue: { rewardKey, rewardName: reward.name, pointsCost: reward.pointsCost },
    });

    revalidatePath("/gamificacao");
    return { data: { id: redemption.id.toString() }, error: null };
  } catch (e) {
    console.error("redeemPointsAction error:", e);
    return { data: null, error: (e as Error).message };
  }
}

export async function listRedemptionsAction(status?: "pending" | "approved" | "rejected" | "fulfilled") {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const rows = await prisma.pointRedemption.findMany({
      where: {
        companyId: user.companyId,
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { name: true, email: true, avatarUrl: true } },
      },
    });

    return {
      data: rows.map((r) => ({
        ...r,
        id: r.id.toString(),
        userId: r.userId.toString(),
        companyId: r.companyId.toString(),
        createdAt: r.createdAt.toISOString(),
        reviewedAt: r.reviewedAt?.toISOString() ?? null,
        fulfilledAt: r.fulfilledAt?.toISOString() ?? null,
      })),
      error: null,
    };
  } catch (e) {
    console.error("listRedemptionsAction error:", e);
    return { data: null, error: (e as Error).message };
  }
}

export async function approveRedemptionAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };
  try {
    await prisma.pointRedemption.updateMany({
      where: { id: BigInt(id), companyId: user.companyId },
      data: { status: "approved", reviewedBy: user.id, reviewedAt: new Date() },
    });
    revalidatePath("/gamificacao");
    return { data: { ok: true }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function rejectRedemptionAction(id: string, notes?: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };
  try {
    await prisma.pointRedemption.updateMany({
      where: { id: BigInt(id), companyId: user.companyId },
      data: { status: "rejected", reviewedBy: user.id, reviewedAt: new Date(), notes: notes ?? null },
    });
    revalidatePath("/gamificacao");
    return { data: { ok: true }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function fulfillRedemptionAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };
  try {
    await prisma.pointRedemption.updateMany({
      where: { id: BigInt(id), companyId: user.companyId },
      data: { status: "fulfilled", fulfilledAt: new Date() },
    });
    revalidatePath("/gamificacao");
    return { data: { ok: true }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

// ================================================================
// SETTINGS — RN-164 (ranking toggle), RN-165 (rewards toggle)
// ================================================================

export async function getGamificationSettingsAction() {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const row = await prisma.systemSetting.findUnique({
      where: { companyId_key: { companyId: user.companyId, key: "gamification.settings" } },
    });
    const defaults = {
      rankingEnabled: false,
      redemptionEnabled: false,
      pointRules: DEFAULT_POINT_RULES,
      rewards: DEFAULT_REWARDS,
    };
    if (!row) return { data: defaults, error: null };
    return { data: { ...defaults, ...(row.value as any) }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function saveGamificationSettingsAction(settings: {
  rankingEnabled?: boolean;
  redemptionEnabled?: boolean;
}) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    await prisma.systemSetting.upsert({
      where: { companyId_key: { companyId: user.companyId, key: "gamification.settings" } },
      update: { value: settings as any },
      create: { companyId: user.companyId, key: "gamification.settings", value: settings as any, group: "gamification" },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "config",
      tableName: "system_settings",
      newValue: { key: "gamification.settings", settings },
    });

    revalidatePath("/gamificacao");
    revalidatePath("/configuracoes");
    return { data: { ok: true }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

// ================================================================
// CATALOG — ACHIEVEMENTS + REWARDS + LEVELS
// ================================================================

export async function getGamificationCatalogAction() {
  // No auth needed — catalog is static
  return {
    data: {
      levels: LEVELS,
      achievements: ACHIEVEMENTS,
      rewards: DEFAULT_REWARDS,
      pointRules: DEFAULT_POINT_RULES,
      medals: [
        { key: "gold", name: "Ouro", icon: "🥇" },
        { key: "silver", name: "Prata", icon: "🥈" },
        { key: "bronze", name: "Bronze", icon: "🥉" },
        { key: "trophy", name: "Troféu", icon: "🏆" },
      ],
    },
    error: null,
  };
}
