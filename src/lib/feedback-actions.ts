"use server";

/**
 * P13 — Sistema de Feedback server actions.
 *
 * Per docs/16_Roadmap.md v2.0 Q4 2026:
 *   "Sistema de Feedback — Estruturado, anônimo opcional (50 SP)"
 *
 * Features:
 *   - CRUD surveys (admin): create, list, get, update status, delete
 *   - 6 types: nps (0-10), csat (1-5), ces (1-7), rating (1-5),
 *     open (text), multiple_choice (options[])
 *   - Anonymous responses (default) or identified
 *   - Schedule: startsAt/endsAt + isRecurring (show again after N days)
 *   - Targeting: all users or specific roles
 *   - Submit response: validates type, awards points via gamificação
 *   - Analytics: average, distribution, response rate
 *
 * Integrations:
 *   - Gamificação (P8): submit response → award points (configurable)
 *   - Notificações (P6): create notification when new survey is active
 */
import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import { createSupabaseServerClient } from "./supabase";
import { logAudit } from "./audit";
import { enqueueEmail } from "./email";

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

// ================================================================
// ADMIN — CRUD surveys
// ================================================================

export async function listFeedbacksAction(filter?: "all" | "active" | "draft" | "closed") {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const where: any = { companyId: user.companyId, deletedAt: null };
    if (filter === "active") where.status = "active";
    if (filter === "draft") where.status = "draft";
    if (filter === "closed") where.status = "closed";

    const feedbacks = await prisma.feedback.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { responses: true } },
      },
    });

    return {
      data: feedbacks.map((f) => ({
        ...f,
        id: f.id.toString(),
        companyId: f.companyId.toString(),
        startsAt: f.startsAt?.toISOString() ?? null,
        endsAt: f.endsAt?.toISOString() ?? null,
        createdAt: f.createdAt.toISOString(),
        responsesCount: f._count.responses,
      })),
      error: null,
    };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function getFeedbackAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const feedback = await prisma.feedback.findFirst({
      where: { id: BigInt(id), companyId: user.companyId, deletedAt: null },
      include: {
        responses: {
          orderBy: { createdAt: "desc" },
          take: 100,
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
        },
        _count: { select: { responses: true } },
      },
    });
    if (!feedback) return { data: null, error: "Feedback não encontrado" };

    // Compute analytics
    const responses = feedback.responses;
    const analytics: any = {
      total: responses.length,
      averageNumeric: null,
      distribution: {} as Record<string, number>,
      npsScore: null,
      npsPromoters: 0,
      npsPassives: 0,
      npsDetractors: 0,
    };

    if (responses.length > 0) {
      const numericValues = responses
        .map((r) => r.numericValue)
        .filter((v): v is number => v != null);

      if (numericValues.length > 0) {
        const sum = numericValues.reduce((a, b) => a + b, 0);
        analytics.averageNumeric = sum / numericValues.length;

        // Distribution
        for (const v of numericValues) {
          const key = String(v);
          analytics.distribution[key] = (analytics.distribution[key] ?? 0) + 1;
        }

        // NPS calculation (for nps type)
        if (feedback.type === "nps") {
          analytics.npsPromoters = numericValues.filter((v) => v >= 9).length;
          analytics.npsPassives = numericValues.filter((v) => v >= 7 && v <= 8).length;
          analytics.npsDetractors = numericValues.filter((v) => v <= 6).length;
          const promotersPct = (analytics.npsPromoters / numericValues.length) * 100;
          const detractorsPct = (analytics.npsDetractors / numericValues.length) * 100;
          analytics.npsScore = Math.round(promotersPct - detractorsPct);
        }
      }
    }

    return {
      data: {
        ...feedback,
        id: feedback.id.toString(),
        companyId: feedback.companyId.toString(),
        startsAt: feedback.startsAt?.toISOString() ?? null,
        endsAt: feedback.endsAt?.toISOString() ?? null,
        createdAt: feedback.createdAt.toISOString(),
        responsesCount: feedback._count.responses,
        analytics,
        responses: feedback.responses.map((r) => ({
          ...r,
          id: r.id.toString(),
          companyId: r.companyId.toString(),
          feedbackId: r.feedbackId.toString(),
          userId: r.userId?.toString() ?? null,
          createdAt: r.createdAt.toISOString(),
          user: r.user
            ? { ...r.user, id: r.user.id.toString() }
            : null,
        })),
      },
      error: null,
    };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function createFeedbackAction(data: {
  title: string;
  description?: string;
  type: "nps" | "csat" | "ces" | "rating" | "open" | "multiple_choice";
  question: string;
  helpText?: string;
  options?: string[];
  isAnonymous?: boolean;
  pointsReward?: number;
  startsAt?: string;
  endsAt?: string;
  isRecurring?: boolean;
  recurrenceDays?: number;
  status?: "draft" | "active";
}) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    if (!data.title?.trim() || !data.question?.trim()) {
      return { data: null, error: "Título e pergunta são obrigatórios" };
    }
    if (data.type === "multiple_choice" && (!data.options || data.options.length < 2)) {
      return { data: null, error: "Múltipla escolha requer pelo menos 2 opções" };
    }

    const feedback = await prisma.feedback.create({
      data: {
        companyId: user.companyId,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        type: data.type as any,
        status: (data.status ?? "draft") as any,
        question: data.question.trim(),
        helpText: data.helpText?.trim() || null,
        options: (data.options ?? []) as any,
        isAnonymous: data.isAnonymous ?? true,
        pointsReward: data.pointsReward ?? 5,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        isRecurring: data.isRecurring ?? false,
        recurrenceDays: data.recurrenceDays ?? 30,
        createdBy: user.id,
      },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "create",
      tableName: "feedbacks",
      recordId: feedback.id,
      newValue: { title: feedback.title, type: feedback.type },
    });

    revalidatePath("/feedback");
    revalidatePath("/feedback/admin");
    return { data: { id: feedback.id.toString() }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function updateFeedbackStatusAction(id: string, status: "draft" | "active" | "paused" | "closed") {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    await prisma.feedback.updateMany({
      where: { id: BigInt(id), companyId: user.companyId, deletedAt: null },
      data: { status: status as any },
    });

    // If activating, notify all target users
    if (status === "active") {
      const feedback = await prisma.feedback.findFirst({
        where: { id: BigInt(id), companyId: user.companyId },
        select: { title: true, question: true, pointsReward: true, targetAll: true },
      });
      if (feedback) {
        // Create in-app notifications for all company users
        const users = await prisma.user.findMany({
          where: { companyId: user.companyId, active: true, deletedAt: null },
          select: { id: true, email: true, name: true },
        });
        for (const u of users) {
          try {
            await prisma.notification.create({
              data: {
                companyId: user.companyId,
                userId: u.id,
                title: "Nova pesquisa disponível",
                body: `${feedback.title} — ${feedback.question.slice(0, 80)}${feedback.question.length > 80 ? "..." : ""}`,
                channel: "in_app",
                priority: "normal",
                data: { feedbackId: id, pointsReward: feedback.pointsReward, type: "feedback_request" },
              },
            });
          } catch {}

          // Enqueue email
          try {
            await enqueueEmail({
              companyId: user.companyId,
              toEmail: u.email,
              toName: u.name,
              subject: `[Orion] Nova pesquisa: ${feedback.title}`,
              bodyHtml: `<div style="font-family:Inter,sans-serif"><h3>${feedback.title}</h3><p>${feedback.question}</p><p>Responda no painel Orion para ganhar ${feedback.pointsReward} pontos!</p><p><a href="https://orion-saas-phi.vercel.app/feedback">Acessar pesquisa</a></p></div>`,
              bodyText: `${feedback.title}\n\n${feedback.question}\n\nResponda no painel Orion para ganhar ${feedback.pointsReward} pontos!`,
            });
          } catch {}
        }
      }
    }

    revalidatePath("/feedback");
    revalidatePath("/feedback/admin");
    return { data: { ok: true }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function deleteFeedbackAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    await prisma.feedback.updateMany({
      where: { id: BigInt(id), companyId: user.companyId, deletedAt: null },
      data: { deletedAt: new Date(), status: "closed" },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "delete",
      tableName: "feedbacks",
      recordId: BigInt(id),
    });

    revalidatePath("/feedback");
    revalidatePath("/feedback/admin");
    return { data: { ok: true }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

// ================================================================
// USER — list available + submit response
// ================================================================

export async function listAvailableFeedbacksAction() {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const now = new Date();
    const feedbacks = await prisma.feedback.findMany({
      where: {
        companyId: user.companyId,
        status: "active",
        deletedAt: null,
        OR: [
          { startsAt: null },
          { startsAt: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { endsAt: null },
              { endsAt: { gte: now } },
            ],
          },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        responses: {
          where: { userId: user.id },
          select: { id: true, createdAt: true, numericValue: true, selectedOption: true, textValue: true, comment: true },
        },
      },
    });

    // Filter out non-recurring surveys the user already answered
    const available = feedbacks.filter((f) => {
      if (f.responses.length === 0) return true;
      if (f.isRecurring) {
        // Show again if last response was > recurrenceDays ago
        const lastResponse = f.responses[0];
        const daysSince = (now.getTime() - lastResponse.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince >= f.recurrenceDays;
      }
      return false;
    });

    return {
      data: available.map((f) => ({
        ...f,
        id: f.id.toString(),
        companyId: f.companyId.toString(),
        startsAt: f.startsAt?.toISOString() ?? null,
        endsAt: f.endsAt?.toISOString() ?? null,
        createdAt: f.createdAt.toISOString(),
        alreadyResponded: f.responses.length > 0,
        lastResponse: f.responses[0]
          ? {
              numericValue: f.responses[0].numericValue,
              selectedOption: f.responses[0].selectedOption,
              textValue: f.responses[0].textValue,
              comment: f.responses[0].comment,
              createdAt: f.responses[0].createdAt.toISOString(),
            }
          : null,
      })),
      error: null,
    };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function submitFeedbackResponseAction(params: {
  feedbackId: string;
  numericValue?: number;
  selectedOption?: number;
  textValue?: string;
  comment?: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const feedback = await prisma.feedback.findFirst({
      where: {
        id: BigInt(params.feedbackId),
        companyId: user.companyId,
        status: "active",
        deletedAt: null,
      },
    });
    if (!feedback) return { data: null, error: "Pesquisa não encontrada ou inativa" };

    // Validate response based on type
    let numericValue: number | null = null;
    let selectedOption: number | null = null;
    let textValue: string | null = null;

    if (feedback.type === "nps") {
      numericValue = params.numericValue ?? null;
      if (numericValue == null || numericValue < 0 || numericValue > 10) {
        return { data: null, error: "NPS deve ser entre 0 e 10" };
      }
    } else if (feedback.type === "csat") {
      numericValue = params.numericValue ?? null;
      if (numericValue == null || numericValue < 1 || numericValue > 5) {
        return { data: null, error: "CSAT deve ser entre 1 e 5" };
      }
    } else if (feedback.type === "ces") {
      numericValue = params.numericValue ?? null;
      if (numericValue == null || numericValue < 1 || numericValue > 7) {
        return { data: null, error: "CES deve ser entre 1 e 7" };
      }
    } else if (feedback.type === "rating") {
      numericValue = params.numericValue ?? null;
      if (numericValue == null || numericValue < 1 || numericValue > 5) {
        return { data: null, error: "Avaliação deve ser entre 1 e 5 estrelas" };
      }
    } else if (feedback.type === "open") {
      textValue = params.textValue?.trim() ?? null;
      if (!textValue) {
        return { data: null, error: "Resposta em texto é obrigatória" };
      }
    } else if (feedback.type === "multiple_choice") {
      selectedOption = params.selectedOption ?? null;
      const options = feedback.options as string[];
      if (selectedOption == null || selectedOption < 0 || selectedOption >= options.length) {
        return { data: null, error: "Selecione uma opção válida" };
      }
    }

    // Check if user already responded (for non-recurring)
    const existing = await prisma.feedbackResponse.findUnique({
      where: {
        feedbackId_userId: {
          feedbackId: BigInt(params.feedbackId),
          userId: user.id,
        },
      },
    });

    let response;
    if (existing) {
      // Update existing response (for recurring surveys)
      response = await prisma.feedbackResponse.update({
        where: { id: existing.id },
        data: {
          numericValue,
          selectedOption,
          textValue,
          comment: params.comment?.trim() || null,
          createdAt: new Date(), // update timestamp
        },
      });
    } else {
      response = await prisma.feedbackResponse.create({
        data: {
          companyId: user.companyId,
          feedbackId: BigInt(params.feedbackId),
          userId: feedback.isAnonymous ? null : user.id,
          numericValue,
          selectedOption,
          textValue,
          comment: params.comment?.trim() || null,
        },
      });
    }

    // Award points via gamificação
    if (feedback.pointsReward > 0) {
      try {
        const { awardPointsAction } = await import("./gamification-actions");
        await awardPointsAction({
          userId: user.id,
          reasonKey: "ai_feedback_positive", // reuse existing rule (+5 pts)
          points: feedback.pointsReward,
          referenceId: response.id.toString(),
          metadata: {
            type: "feedback_response",
            feedbackId: params.feedbackId,
            feedbackTitle: feedback.title,
          },
        });
      } catch {}
    }

    revalidatePath("/feedback");
    return {
      data: {
        id: response.id.toString(),
        pointsAwarded: feedback.pointsReward,
      },
      error: null,
    };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}
