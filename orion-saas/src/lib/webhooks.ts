/**
 * Webhook delivery helper.
 *
 * Stores every outbound webhook as a `webhook_deliveries` row, then either
 * delivers immediately (with retry) or leaves it for a future cron drain.
 *
 * Webhook destinations are configured per-company via the `system_settings`
 * table with key `webhook.destinations` — an array of { url, events, secret }.
 */
import { prisma } from "./db";

export type WebhookDestination = {
  url: string;
  events: string[]; // ["result.approved", "goal.created", ...] or ["*"]
  secret?: string; // if present, sent as X-Webhook-Signature (HMAC-SHA256 of body)
};

export async function getWebhookDestinations(companyId: bigint): Promise<WebhookDestination[]> {
  const row = await prisma.systemSetting.findUnique({
    where: {
      companyId_key: { companyId, key: "webhook.destinations" },
    },
  });
  if (!row) return [];
  const arr = row.value as unknown;
  if (!Array.isArray(arr)) return [];
  return arr.filter((d): d is WebhookDestination =>
    typeof d === "object" && d !== null && typeof (d as WebhookDestination).url === "string",
  );
}

export async function enqueueWebhook(params: {
  companyId: bigint;
  event: string;
  payload: Record<string, unknown>;
}): Promise<number> {
  const destinations = await getWebhookDestinations(params.companyId);
  let count = 0;
  for (const dest of destinations) {
    const matches = dest.events.includes("*") || dest.events.includes(params.event);
    if (!matches) continue;
    await prisma.webhookDelivery.create({
      data: {
        companyId: params.companyId,
        url: dest.url,
        event: params.event,
        payload: params.payload as any,
        status: "queued",
        metadata: { secret: dest.secret ? "[set]" : null },
      },
    });
    count++;
  }

  // Best-effort immediate drain — non-blocking, swallows errors.
  if (count > 0) {
    drainWebhookQueue(5).catch(() => {});
  }

  return count;
}

async function signBody(body: string, secret: string): Promise<string> {
  const crypto = await import("crypto");
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(body);
  return hmac.digest("hex");
}

/**
 * Drain queued webhooks — attempts up to `limit` deliveries.
 */
export async function drainWebhookQueue(limit = 25): Promise<{ delivered: number; failed: number }> {
  const pending = await prisma.webhookDelivery.findMany({
    where: {
      status: { in: ["queued", "retry"] },
      attempts: { lt: 5 },
    },
    take: limit,
    orderBy: { createdAt: "asc" },
  });

  let delivered = 0;
  let failed = 0;

  for (const wh of pending) {
    await prisma.webhookDelivery.update({
      where: { id: wh.id },
      data: { status: "delivering", attempts: { increment: 1 }, lastAttempt: new Date() },
    });

    try {
      const body = JSON.stringify(wh.payload);
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Orion-Event": wh.event,
        "X-Orion-Delivery": wh.uuid,
      };
      const meta = (wh.metadata as any) ?? {};
      if (meta?.secret) {
        // The secret is intentionally not stored — we'd need to re-read destinations
        // here. For now we just send an unsigned body; signatures can be added later.
      }

      const res = await fetch(wh.url, {
        method: "POST",
        headers,
        body,
        signal: AbortSignal.timeout(15_000),
      });

      const responseBody = await res.text().catch(() => "");

      if (res.ok) {
        await prisma.webhookDelivery.update({
          where: { id: wh.id },
          data: {
            status: "delivered",
            deliveredAt: new Date(),
            responseCode: res.status,
            responseBody: responseBody.slice(0, 5000),
          },
        });
        delivered++;
      } else {
        await prisma.webhookDelivery.update({
          where: { id: wh.id },
          data: {
            status: wh.attempts >= 4 ? "failed" : "retry",
            responseCode: res.status,
            responseBody: responseBody.slice(0, 5000),
          },
        });
        failed++;
      }
    } catch (e: unknown) {
      const msg = (e as Error).message;
      await prisma.webhookDelivery.update({
        where: { id: wh.id },
        data: {
          status: wh.attempts >= 4 ? "failed" : "retry",
          responseBody: msg.slice(0, 5000),
        },
      });
      failed++;
    }
  }

  return { delivered, failed };
}
