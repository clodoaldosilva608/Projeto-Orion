/**
 * Email (SMTP) helper.
 *
 * Lazy-imports nodemailer so the build doesn't fail if SMTP isn't configured.
 * All outbound emails go through the `email_queue` table for traceability;
 * this module then drains the queue when called.
 *
 * Required env vars (all optional — if missing, emails stay in `queued`):
 *   - SMTP_HOST
 *   - SMTP_PORT (defaults to 587)
 *   - SMTP_USER
 *   - SMTP_PASS
 *   - SMTP_FROM (defaults to "Orion <noreply@orion.com>")
 */
import { prisma } from "./db";
import { logAudit } from "./audit";

export type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  secure: boolean;
};

export function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  const port = Number(process.env.SMTP_PORT ?? 587);
  return {
    host,
    port,
    user,
    pass,
    from: process.env.SMTP_FROM ?? "Orion <noreply@orion.com>",
    secure: port === 465,
  };
}

async function getTransporter() {
  const cfg = getSmtpConfig();
  if (!cfg) return null;
  const nodemailer = await import("nodemailer");
  return nodemailer.default.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
  });
}

/**
 * Enqueue an email — creates an `email_queue` row, then immediately
 * attempts to send it via SMTP (best-effort, in-process). If SMTP fails
 * or isn't configured, the row stays in `queued` and will be picked up
 * by the next /api/cron/drain call.
 *
 * Returns the row id (as string).
 */
export async function enqueueEmail(params: {
  companyId: bigint;
  toEmail: string;
  toName?: string;
  subject: string;
  bodyHtml?: string;
  bodyText?: string;
  metadata?: Record<string, unknown>;
}) {
  const row = await prisma.emailQueue.create({
    data: {
      companyId: params.companyId,
      toEmail: params.toEmail,
      toName: params.toName ?? null,
      subject: params.subject,
      bodyHtml: params.bodyHtml ?? null,
      bodyText: params.bodyText ?? null,
      status: "queued",
      metadata: (params.metadata as any) ?? {},
    },
  });

  // Best-effort immediate drain — non-blocking, swallows errors.
  drainEmailQueue(5).catch(() => {});

  return row.id.toString();
}

/**
 * Drain the email queue — attempt to send up to `limit` queued emails.
 * Returns the number of successfully-sent messages.
 *
 * This is meant to be called from a cron / scheduled API route.
 */
export async function drainEmailQueue(limit = 25): Promise<{ sent: number; failed: number }> {
  const transporter = await getTransporter();
  if (!transporter) {
    // No SMTP configured — leave emails in `queued` so they can be sent
    // later once SMTP is configured.
    return { sent: 0, failed: 0 };
  }

  const cfg = getSmtpConfig()!;

  // Pick up at most `limit` queued messages that haven't been tried too many times.
  const pending = await prisma.emailQueue.findMany({
    where: {
      status: "queued",
      attempts: { lt: 5 },
    },
    take: limit,
    orderBy: { createdAt: "asc" },
  });

  let sent = 0;
  let failed = 0;

  for (const email of pending) {
    await prisma.emailQueue.update({
      where: { id: email.id },
      data: { status: "sending", attempts: { increment: 1 }, lastAttempt: new Date() },
    });

    try {
      const info = await transporter.sendMail({
        from: cfg.from,
        to: email.toName ? `${email.toName} <${email.toEmail}>` : email.toEmail,
        subject: email.subject,
        html: email.bodyHtml ?? undefined,
        text: email.bodyText ?? undefined,
      });

      await prisma.emailQueue.update({
        where: { id: email.id },
        data: {
          status: "sent",
          sentAt: new Date(),
          metadata: { ...(email.metadata as any), messageId: info.messageId },
        },
      });
      sent++;
    } catch (e: unknown) {
      const msg = (e as Error).message;
      await prisma.emailQueue.update({
        where: { id: email.id },
        data: {
          status: email.attempts >= 4 ? "failed" : "queued",
          errorMsg: msg.slice(0, 1000),
        },
      });
      failed++;
    }
  }

  return { sent, failed };
}

/**
 * Send a single email immediately (bypassing the queue). Falls back to
 * enqueuing if SMTP isn't configured.
 */
export async function sendEmailNow(params: {
  companyId: bigint;
  toEmail: string;
  toName?: string;
  subject: string;
  bodyHtml?: string;
  bodyText?: string;
  userId?: bigint | null;
}): Promise<{ ok: boolean; queued: boolean; error?: string }> {
  const transporter = await getTransporter();
  if (!transporter) {
    await enqueueEmail(params);
    return { ok: true, queued: true };
  }
  const cfg = getSmtpConfig()!;
  try {
    const info = await transporter.sendMail({
      from: cfg.from,
      to: params.toName ? `${params.toName} <${params.toEmail}>` : params.toEmail,
      subject: params.subject,
      html: params.bodyHtml ?? undefined,
      text: params.bodyText ?? undefined,
    });
    await prisma.emailQueue.create({
      data: {
        companyId: params.companyId,
        toEmail: params.toEmail,
        toName: params.toName ?? null,
        subject: params.subject,
        bodyHtml: params.bodyHtml ?? null,
        bodyText: params.bodyText ?? null,
        status: "sent",
        sentAt: new Date(),
        metadata: { messageId: info.messageId, immediate: true },
      },
    });
    return { ok: true, queued: false };
  } catch (e: unknown) {
    const msg = (e as Error).message;
    await enqueueEmail(params);
    if (params.userId) {
      await logAudit({
        companyId: params.companyId,
        userId: params.userId,
        action: "config",
        tableName: "email_queue",
        newValue: { toEmail: params.toEmail, subject: params.subject, error: msg },
      });
    }
    return { ok: false, queued: true, error: msg };
  }
}
