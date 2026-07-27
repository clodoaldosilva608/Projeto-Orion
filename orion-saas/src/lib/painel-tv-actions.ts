"use server";

/**
 * P11 — Painel TV server actions.
 *
 * Per docs/16_Roadmap.md v2.0 Q3 2026:
 *   "Painel TV — Smart TV (Tizen, webOS) para ranking em tempo real"
 *
 * The TV dashboard is designed for:
 *   - Large screens (1920x1080+) in sales rooms
 *   - Visibility from 5+ meters away (huge fonts, high contrast)
 *   - Auto-refresh every 30 seconds (no manual interaction)
 *   - Screen rotation (ranking / campaigns / KPIs)
 *   - No sidebar/header (full-screen layout)
 *
 * Auth: requires login OR a ?key=<TV_TOKEN> query param for kiosk mode
 * (so the TV can be set up once and never need to log in again).
 */
import { prisma } from "./db";
import { createSupabaseServerClient } from "./supabase";
import { getLevelForPoints, LEVELS } from "./gamification";

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

async function getCompanyByTvToken(token: string) {
  if (!token) return null;
  // TV_TOKEN is stored in system_settings key 'tv.token' as JSON { token: "tv_xxx" }
  // We need to find across all companies since we don't know which one yet.
  // Prisma JSON filtering: use path + equals
  const settings = await prisma.systemSetting.findMany({
    where: { key: "tv.token" },
  });
  for (const s of settings) {
    const val = s.value as any;
    if (typeof val === "string" && val === token) {
      const company = await prisma.company.findUnique({
        where: { id: s.companyId! },
        select: { id: true, tradeName: true, legalName: true },
      });
      if (company) return company;
    } else if (val && typeof val === "object" && val.token === token) {
      const company = await prisma.company.findUnique({
        where: { id: s.companyId! },
        select: { id: true, tradeName: true, legalName: true },
      });
      if (company) return company;
    }
  }
  return null;
}

async function resolveCompany(tvToken?: string) {
  // First try authenticated user
  const user = await getCurrentUser();
  if (user) {
    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      select: { id: true, tradeName: true, legalName: true },
    });
    return { company, user };
  }
  // Fall back to TV token
  if (tvToken) {
    const company = await getCompanyByTvToken(tvToken);
    if (company) return { company, user: null };
  }
  return { company: null, user: null };
}

// ================================================================
// MAIN — getTvDataAction returns everything for the TV dashboard
// ================================================================

export async function getTvDataAction(tvToken?: string) {
  const { company, user } = await resolveCompany(tvToken);
  if (!company) return { data: null, error: "Não autorizado" };

  try {
    const companyId = company.id;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, -3, 0, 0);

    const [
      topUsers,
      activeCampaigns,
      goalsCount,
      approvedResultsCount,
      pendingResultsCount,
      totalUsers,
      indicatorsCount,
      recentApprovals,
      upcomingCampaignEndings,
    ] = await Promise.all([
      // Top 10 users by monthly points
      prisma.pointTransaction.groupBy({
        by: ["userId"],
        where: { companyId, createdAt: { gte: monthStart } },
        _sum: { points: true },
        orderBy: { _sum: { points: "desc" } },
        take: 10,
      }),
      // Active campaigns
      prisma.campaign.findMany({
        where: {
          companyId,
          status: "active",
          deletedAt: null,
          startDate: { lte: now },
          endDate: { gte: now },
        },
        orderBy: { endDate: "asc" },
        take: 5,
        include: {
          _count: { select: { participants: true, awards: true } },
        },
      }),
      // Goals count
      prisma.goal.count({
        where: { companyId, active: true, deletedAt: null },
      }),
      // Approved results count (this month)
      prisma.result.count({
        where: {
          companyId,
          status: "approved",
          createdAt: { gte: monthStart },
        },
      }),
      // Pending results count
      prisma.result.count({
        where: { companyId, status: "pending" },
      }),
      // Total active users
      prisma.user.count({
        where: { companyId, active: true, deletedAt: null },
      }),
      // Indicators count
      prisma.indicator.count({
        where: { companyId, active: true, deletedAt: null },
      }),
      // Recent approved results (last 5)
      prisma.result.findMany({
        where: { companyId, status: "approved" },
        orderBy: { approvedAt: "desc" },
        take: 5,
        include: {
          user: { select: { name: true, avatarUrl: true } },
          goal: { select: { name: true } },
        },
      }),
      // Upcoming campaign endings (next 7 days)
      prisma.campaign.findMany({
        where: {
          companyId,
          status: "active",
          deletedAt: null,
          endDate: {
            gte: now,
            lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: { endDate: "asc" },
        take: 3,
        select: { id: true, name: true, endDate: true },
      }),
    ]);

    // Hydrate top users with names
    const topUserIds = topUsers.map((t) => t.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: topUserIds } },
      select: { id: true, name: true, jobTitle: true, avatarUrl: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const ranking = topUsers.map((t, idx) => {
      const u = userMap.get(t.userId);
      const points = t._sum.points ?? 0;
      return {
        position: idx + 1,
        userId: t.userId.toString(),
        name: u?.name ?? "—",
        jobTitle: u?.jobTitle ?? null,
        avatarUrl: u?.avatarUrl ?? null,
        points,
        level: getLevelForPoints(points),
      };
    });

    // Compute total monthly points
    const totalMonthPoints = ranking.reduce((acc, r) => acc + r.points, 0);

    return {
      data: {
        company: {
          id: company.id.toString(),
          name: company.tradeName || company.legalName,
        },
        now: now.toISOString(),
        ranking,
        top3: ranking.slice(0, 3),
        activeCampaigns: activeCampaigns.map((c) => {
          const daysLeft = Math.ceil(
            (c.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
          return {
            id: c.id.toString(),
            name: c.name,
            description: c.description,
            startDate: c.startDate.toISOString(),
            endDate: c.endDate.toISOString(),
            daysLeft,
            participantsCount: c._count.participants,
            awardsCount: c._count.awards,
          };
        }),
        upcomingEndings: upcomingCampaignEndings.map((c) => ({
          id: c.id.toString(),
          name: c.name,
          endDate: c.endDate.toISOString(),
          daysLeft: Math.ceil(
            (c.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 1000 * 24)
          ),
        })),
        recentApprovals: recentApprovals.map((r) => ({
          id: r.id.toString(),
          value: Number(r.value),
          userName: r.user?.name ?? "—",
          userAvatar: r.user?.avatarUrl ?? null,
          goalName: r.goal?.name ?? "—",
          approvedAt: r.approvedAt?.toISOString() ?? null,
        })),
        kpis: {
          goals: goalsCount,
          approvedResultsThisMonth: approvedResultsCount,
          pendingResults: pendingResultsCount,
          activeUsers: totalUsers,
          indicators: indicatorsCount,
          totalMonthPoints,
        },
      },
      error: null,
    };
  } catch (e) {
    console.error("getTvDataAction error:", e);
    return { data: null, error: (e as Error).message };
  }
}

// ================================================================
// TV TOKEN — generate/retrieve for kiosk mode
// ================================================================

export async function getTvTokenAction() {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    let setting = await prisma.systemSetting.findUnique({
      where: {
        companyId_key: { companyId: user.companyId, key: "tv.token" },
      },
    });

    if (!setting) {
      // Generate a new token
      const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
      let token = "tv_";
      for (let i = 0; i < 24; i++) {
        token += chars[Math.floor(Math.random() * chars.length)];
      }
      setting = await prisma.systemSetting.create({
        data: {
          companyId: user.companyId,
          key: "tv.token",
          value: { token } as any,
          isPublic: false,
        },
      });
      return { data: { token }, error: null };
    }

    // Extract token from stored JSON
    const val = setting.value as any;
    const token = typeof val === "string" ? val : val?.token;
    return { data: { token }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function regenerateTvTokenAction() {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let token = "tv_";
    for (let i = 0; i < 24; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
    }

    await prisma.systemSetting.upsert({
      where: { companyId_key: { companyId: user.companyId, key: "tv.token" } },
      update: { value: { token } as any },
      create: { companyId: user.companyId, key: "tv.token", value: { token } as any },
    });

    return { data: { token }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}
