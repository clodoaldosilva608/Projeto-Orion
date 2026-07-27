import { NextResponse, type NextRequest } from "next/server";
import { drainEmailQueue } from "@/lib/email";
import { drainWebhookQueue } from "@/lib/webhooks";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/drain?key=<CRON_SECRET>
 *
 * Drains both the email queue and the webhook queue. Meant to be called by
 * Vercel Cron (every 5 minutes) — protected by a shared secret.
 */
export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  const expected = process.env.CRON_SECRET;
  if (!expected || key !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const emails = await drainEmailQueue(50);
  const webhooks = await drainWebhookQueue(50);
  return NextResponse.json({ ok: true, emails, webhooks });
}
