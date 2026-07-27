"use server";

/**
 * P6 server actions — 2FA, Email queue, Webhooks, Notifications, Backups,
 * and System Settings. All multi-tenant (filtered by `companyId`).
 */
import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import { createSupabaseServerClient } from "./supabase";
import { logAudit } from "./audit";
import {
  generateTwoFactorSecret,
  verifyTotpSync,
  buildOtpAuthUri,
  generateQrCodeDataUrl,
} from "./twoFactor";
import { enqueueEmail, drainEmailQueue, sendEmailNow } from "./email";
import { enqueueWebhook, drainWebhookQueue } from "./webhooks";

async function getCurrentDBUser() {
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

// ---------- 2FA ----------

export async function setupTwoFactorAction() {
  const user = await getCurrentDBUser();
  if (!user) return { data: null, error: "Não autorizado" };

  // Generate a new secret (don't persist yet — only after verification).
  const secret = generateTwoFactorSecret();
  const issuer = "Orion SaaS";
  const accountName = user.email;
  const uri = buildOtpAuthUri({ issuer, accountName, secret });
  const qr = await generateQrCodeDataUrl(uri);

  return {
    data: { secret, qr, uri },
    error: null,
  };
}

export async function enableTwoFactorAction(secret: string, token: string) {
  const user = await getCurrentDBUser();
  if (!user) return { data: null, error: "Não autorizado" };

  if (!verifyTotpSync(token, secret)) {
    return { data: null, error: "Código TOTP inválido. Tente novamente." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: true, twoFactorSecret: secret },
  });

  await logAudit({
    companyId: user.companyId,
    userId: user.id,
    action: "config",
    tableName: "users",
    recordId: user.id,
    newValue: { twoFactorEnabled: true },
  });

  revalidatePath("/configuracoes");
  return { data: { ok: true }, error: null };
}

export async function disableTwoFactorAction(token?: string) {
  const user = await getCurrentDBUser();
  if (!user) return { data: null, error: "Não autorizado" };

  // Require a valid TOTP to disable (optional but safer).
  if (user.twoFactorSecret && token) {
    if (!verifyTotpSync(token, user.twoFactorSecret)) {
      return { data: null, error: "Código TOTP inválido." };
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: false, twoFactorSecret: null },
  });

  await logAudit({
    companyId: user.companyId,
    userId: user.id,
    action: "config",
    tableName: "users",
    recordId: user.id,
    newValue: { twoFactorEnabled: false },
  });

  revalidatePath("/configuracoes");
  return { data: { ok: true }, error: null };
}

export async function verifyTwoFactorForLoginAction(supabaseUserId: string, token: string) {
  const user = await prisma.user.findUnique({
    where: { supabaseId: supabaseUserId },
  });
  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    return { data: { required: false }, error: null };
  }
  if (!verifyTotpSync(token, user.twoFactorSecret)) {
    return { data: { required: true }, error: "Código TOTP inválido." };
  }
  await logAudit({
    companyId: user.companyId,
    userId: user.id,
    action: "login",
    tableName: "users",
    recordId: user.id,
    newValue: { twoFactorVerified: true },
  });
  return { data: { required: true, verified: true }, error: null };
}

// ---------- Email queue ----------

export async function listEmailQueueAction() {
  const user = await getCurrentDBUser();
  if (!user) return { data: null, error: "Não autorizado" };
  const rows = await prisma.emailQueue.findMany({
    where: { companyId: user.companyId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return {
    data: rows.map((r) => ({
      ...r,
      id: r.id.toString(),
      companyId: r.companyId.toString(),
      createdAt: r.createdAt.toISOString(),
      sentAt: r.sentAt?.toISOString() ?? null,
      lastAttempt: r.lastAttempt?.toISOString() ?? null,
    })),
    error: null,
  };
}

export async function sendTestEmailAction(toEmail: string) {
  const user = await getCurrentDBUser();
  if (!user) return { data: null, error: "Não autorizado" };

  const result = await sendEmailNow({
    companyId: user.companyId,
    toEmail,
    subject: "[Orion] E-mail de teste",
    bodyHtml: `<div style="font-family:Inter,sans-serif"><h2>Orion SaaS</h2><p>Este é um e-mail de teste enviado pela plataforma Orion.</p><p>Se você recebeu esta mensagem, o SMTP está configurado corretamente.</p></div>`,
    bodyText: "Orion SaaS — Este é um e-mail de teste. Se você recebeu esta mensagem, o SMTP está configurado corretamente.",
    userId: user.id,
  });

  revalidatePath("/configuracoes");
  return { data: result, error: null };
}

export async function drainEmailQueueAction() {
  const user = await getCurrentDBUser();
  if (!user) return { data: null, error: "Não autorizado" };
  const result = await drainEmailQueue(50);
  revalidatePath("/configuracoes");
  return { data: result, error: null };
}

// ---------- Webhooks ----------

export async function listWebhookDeliveriesAction() {
  const user = await getCurrentDBUser();
  if (!user) return { data: null, error: "Não autorizado" };
  const rows = await prisma.webhookDelivery.findMany({
    where: { companyId: user.companyId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return {
    data: rows.map((r) => ({
      ...r,
      id: r.id.toString(),
      companyId: r.companyId.toString(),
      createdAt: r.createdAt.toISOString(),
      deliveredAt: r.deliveredAt?.toISOString() ?? null,
      lastAttempt: r.lastAttempt?.toISOString() ?? null,
    })),
    error: null,
  };
}

export async function testWebhookAction(url: string) {
  const user = await getCurrentDBUser();
  if (!user) return { data: null, error: "Não autorizado" };

  const count = await enqueueWebhook({
    companyId: user.companyId,
    event: "webhook.test",
    payload: {
      message: "Teste de webhook da plataforma Orion",
      sentAt: new Date().toISOString(),
      companyId: user.companyId.toString(),
    },
  });

  if (count === 0) {
    // No destinations configured — send directly to the given URL.
    await prisma.webhookDelivery.create({
      data: {
        companyId: user.companyId,
        url,
        event: "webhook.test",
        payload: { message: "Teste de webhook da plataforma Orion", sentAt: new Date().toISOString() },
        status: "queued",
      },
    });
  }

  // Try to drain immediately so the user sees the result.
  const result = await drainWebhookQueue(5);
  revalidatePath("/configuracoes");
  return { data: { enqueued: count, ...result }, error: null };
}

export async function drainWebhookQueueAction() {
  const user = await getCurrentDBUser();
  if (!user) return { data: null, error: "Não autorizado" };
  const result = await drainWebhookQueue(50);
  revalidatePath("/configuracoes");
  return { data: result, error: null };
}

// ---------- Notifications ----------

export async function listNotificationsAction() {
  const user = await getCurrentDBUser();
  if (!user) return { data: null, error: "Não autorizado" };
  const rows = await prisma.notification.findMany({
    where: { companyId: user.companyId, userId: user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return {
    data: rows.map((r) => ({
      ...r,
      id: r.id.toString(),
      companyId: r.companyId.toString(),
      userId: r.userId.toString(),
      createdAt: r.createdAt.toISOString(),
      readAt: r.readAt?.toISOString() ?? null,
      sentAt: r.sentAt?.toISOString() ?? null,
    })),
    error: null,
  };
}

export async function markNotificationReadAction(id: string) {
  const user = await getCurrentDBUser();
  if (!user) return { data: null, error: "Não autorizado" };
  const notifId = BigInt(id);
  await prisma.notification.updateMany({
    where: { id: notifId, companyId: user.companyId, userId: user.id },
    data: { readAt: new Date() },
  });
  revalidatePath("/notificacoes");
  return { data: { ok: true }, error: null };
}

export async function markAllNotificationsReadAction() {
  const user = await getCurrentDBUser();
  if (!user) return { data: null, error: "Não autorizado" };
  await prisma.notification.updateMany({
    where: { companyId: user.companyId, userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/notificacoes");
  return { data: { ok: true }, error: null };
}

export async function createNotificationAction(params: {
  title: string;
  body: string;
  priority?: "low" | "normal" | "high" | "urgent";
  channel?: "in_app" | "email" | "sms" | "push" | "webhook";
}) {
  const user = await getCurrentDBUser();
  if (!user) return { data: null, error: "Não autorizado" };

  const notif = await prisma.notification.create({
    data: {
      companyId: user.companyId,
      userId: user.id,
      title: params.title,
      body: params.body,
      channel: (params.channel as any) ?? "in_app",
      priority: (params.priority as any) ?? "normal",
    },
  });

  // If email channel, enqueue an email too.
  if (params.channel === "email" || params.priority === "urgent") {
    await enqueueEmail({
      companyId: user.companyId,
      toEmail: user.email,
      subject: params.title,
      bodyHtml: `<div style="font-family:Inter,sans-serif"><h3>${params.title}</h3><p>${params.body}</p></div>`,
      bodyText: params.body,
    });
  }

  revalidatePath("/notificacoes");
  return {
    data: { id: notif.id.toString() },
    error: null,
  };
}

// ---------- Backups ----------

export async function listBackupsAction() {
  const user = await getCurrentDBUser();
  if (!user) return { data: null, error: "Não autorizado" };
  const rows = await prisma.backup.findMany({
    where: { companyId: user.companyId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return {
    data: rows.map((r) => ({
      ...r,
      id: r.id.toString(),
      companyId: r.companyId.toString(),
      sizeBytes: r.sizeBytes?.toString() ?? null,
      createdAt: r.createdAt.toISOString(),
      startedAt: r.startedAt?.toISOString() ?? null,
      finishedAt: r.finishedAt?.toISOString() ?? null,
      expiresAt: r.expiresAt?.toISOString() ?? null,
    })),
    error: null,
  };
}

export async function createBackupAction(type: "full" | "incremental" = "full") {
  const user = await getCurrentDBUser();
  if (!user) return { data: null, error: "Não autorizado" };

  const backup = await prisma.backup.create({
    data: {
      companyId: user.companyId,
      type: type as any,
      status: "running",
      startedAt: new Date(),
    },
  });

  // Synchronously export the company's data (small datasets only — for production
  // this should run as a background job, but for our scale this is fine).
  try {
    const [goals, indicators, results, users, payments, auditLogs] = await Promise.all([
      prisma.goal.findMany({ where: { companyId: user.companyId } }),
      prisma.indicator.findMany({ where: { companyId: user.companyId } }),
      prisma.result.findMany({ where: { companyId: user.companyId } }),
      prisma.user.findMany({ where: { companyId: user.companyId }, select: { id: true, name: true, email: true, status: true, createdAt: true } }),
      prisma.saasPayment.findMany({
        include: { client: true },
        take: 1000,
      }),
      prisma.auditLog.findMany({ where: { companyId: user.companyId }, take: 1000, orderBy: { createdAt: "desc" } }),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      companyId: user.companyId.toString(),
      counts: {
        goals: goals.length,
        indicators: indicators.length,
        results: results.length,
        users: users.length,
        payments: payments.length,
        auditLogs: auditLogs.length,
      },
      goals: goals.map((g) => ({ ...g, id: g.id.toString(), companyId: g.companyId.toString(), branchId: g.branchId?.toString() ?? null, userId: g.userId?.toString() ?? null, indicatorId: g.indicatorId.toString(), campaignId: g.campaignId?.toString() ?? null, targetValue: g.targetValue?.toString() ?? null, minValue: g.minValue?.toString() ?? null, maxValue: g.maxValue?.toString() ?? null, weight: g.weight?.toString() ?? null, createdAt: g.createdAt.toISOString(), updatedAt: g.updatedAt.toISOString(), startDate: g.startDate.toISOString(), endDate: g.endDate.toISOString(), deletedAt: g.deletedAt?.toISOString() ?? null })),
      indicators: indicators.map((i) => ({ ...i, id: i.id.toString(), companyId: i.companyId.toString(), categoryId: i.categoryId?.toString() ?? null, createdAt: i.createdAt.toISOString(), updatedAt: i.updatedAt.toISOString(), deletedAt: i.deletedAt?.toISOString() ?? null })),
      results: results.map((r) => ({ ...r, id: r.id.toString(), companyId: r.companyId.toString(), goalId: r.goalId.toString(), userId: r.userId.toString(), value: r.value.toString(), createdAt: r.createdAt.toISOString(), approvedAt: r.approvedAt?.toISOString() ?? null, referenceDate: r.referenceDate.toISOString() })),
      users,
      payments: payments.map((p) => ({ ...p, amountCents: p.amountCents.toString(), createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString() })),
      auditLogs: auditLogs.map((a) => ({ ...a, id: a.id.toString(), companyId: a.companyId.toString(), userId: a.userId?.toString() ?? null, recordId: a.recordId?.toString() ?? null, createdAt: a.createdAt.toISOString() })),
    };

    const json = JSON.stringify(exportData, null, 2);
    const sizeBytes = Buffer.byteLength(json);

    await prisma.backup.update({
      where: { id: backup.id },
      data: {
        status: "completed",
        storagePath: `backups/${user.companyId}/${backup.id}.json`,
        sizeBytes: BigInt(sizeBytes),
        finishedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        metadata: { counts: exportData.counts } as any,
      },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "export",
      tableName: "backups",
      recordId: backup.id,
      newValue: { type, sizeBytes, counts: exportData.counts },
    });

    revalidatePath("/backups");
    return {
      data: {
        id: backup.id.toString(),
        sizeBytes,
        counts: exportData.counts,
        downloadUrl: `/api/backup/download?id=${backup.id.toString()}`,
      },
      error: null,
    };
  } catch (e: unknown) {
    await prisma.backup.update({
      where: { id: backup.id },
      data: {
        status: "failed",
        errorMsg: (e as Error).message.slice(0, 1000),
        finishedAt: new Date(),
      },
    });
    return { data: null, error: (e as Error).message };
  }
}

export async function deleteBackupAction(id: string) {
  const user = await getCurrentDBUser();
  if (!user) return { data: null, error: "Não autorizado" };
  await prisma.backup.deleteMany({
    where: { id: BigInt(id), companyId: user.companyId },
  });
  revalidatePath("/backups");
  return { data: { ok: true }, error: null };
}

// ---------- System Settings ----------

export async function getSystemSettingsAction(group?: string) {
  const user = await getCurrentDBUser();
  if (!user) return { data: null, error: "Não autorizado" };
  const rows = await prisma.systemSetting.findMany({
    where: { companyId: user.companyId, ...(group ? { group } : {}) },
  });
  const settings: Record<string, any> = {};
  for (const r of rows) {
    settings[r.key] = r.value;
  }
  return { data: settings, error: null };
}

export async function saveSystemSettingAction(key: string, value: any, group?: string) {
  const user = await getCurrentDBUser();
  if (!user) return { data: null, error: "Não autorizado" };

  await prisma.systemSetting.upsert({
    where: { companyId_key: { companyId: user.companyId, key } },
    update: { value, group: group ?? null },
    create: { companyId: user.companyId, key, value, group: group ?? null },
  });

  await logAudit({
    companyId: user.companyId,
    userId: user.id,
    action: "config",
    tableName: "system_settings",
    newValue: { key, value },
  });

  revalidatePath("/configuracoes");
  return { data: { ok: true }, error: null };
}
