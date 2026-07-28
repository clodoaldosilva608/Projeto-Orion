import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * GET /api/cron/expire-trials
 *
 * Cron job que roda hora a hora (configurado no vercel.json).
 * Faz 3 coisas:
 *
 * 1. Suspende licenças trial expiradas (status='trial' + trialEndsAt < now):
 *    → license.status = 'suspended', active = false
 *    → company.active = false
 *    → envia email "trial expirado"
 *
 * 2. Envia email "trial expirando" para trials que faltam 3 dias
 *    (apenas 1x por trial — controlado por metadata.emailSent)
 *
 * 3. Suspende licenças pagas com expirationDate < now (pagamento não renovou)
 *
 * Header: X-Cron-Secret deve bater com CRON_SECRET env var.
 */
export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret") || request.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const now = new Date();
  const stats = { expired: 0, expiringSoon: 0, paymentExpired: 0, errors: 0 };

  try {
    // === 1. EXPIRAR TRIALS ===
    const expiredTrials = await prisma.license.findMany({
      where: {
        status: "trial",
        trialEndsAt: { lt: now },
      },
      include: {
        companies: {
          select: { id: true, tradeName: true, appName: true, email: true, active: true },
        },
      },
    });

    for (const license of expiredTrials) {
      try {
        // Atualiza licença
        await prisma.license.update({
          where: { id: license.id },
          data: { status: "suspended", active: false },
        });

        // Suspende empresas vinculadas
        for (const company of license.companies) {
          await prisma.company.update({
            where: { id: company.id },
            data: { active: false },
          });

          // Envia email de trial expirado
          if (company.email) {
            try {
              const { trialExpiredEmail, sendEmail } = await import("@/lib/emails");
              await sendEmail(trialExpiredEmail(
                { appName: company.appName },
                company.email,
                company.tradeName,
              ));
            } catch (e) { /* não bloqueia */ }
          }
        }

        stats.expired++;
        console.log(`[cron:expire-trials] Trial expirado: license ${license.id}`);
      } catch (e: any) {
        stats.errors++;
        console.error(`[cron:expire-trials] Erro expirando license ${license.id}:`, e.message);
      }
    }

    // === 2. AVISAR TRIALS EXPIRANDO EM 3 DIAS ===
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const expiringSoon = await prisma.license.findMany({
      where: {
        status: "trial",
        trialEndsAt: {
          gt: now,
          lt: threeDaysFromNow,
        },
      },
      include: {
        companies: { select: { id: true, tradeName: true, appName: true, email: true } },
      },
    });

    for (const license of expiringSoon) {
      const meta = (license.metadata as any) || {};
      if (meta.trialExpiringEmailSent) continue; // já enviou

      const daysLeft = Math.ceil((license.trialEndsAt!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      for (const company of license.companies) {
        if (!company.email) continue;
        try {
          const { trialExpiringEmail, sendEmail } = await import("@/lib/emails");
          await sendEmail(trialExpiringEmail(
            { appName: company.appName },
            company.email,
            company.tradeName,
            daysLeft,
          ));
        } catch (e) { /* não bloqueia */ }
      }

      // Marca como enviado
      await prisma.license.update({
        where: { id: license.id },
        data: { metadata: { ...meta, trialExpiringEmailSent: true, sentAt: now.toISOString() } },
      });

      stats.expiringSoon++;
      console.log(`[cron:expire-trials] Aviso enviado: license ${license.id} (${daysLeft} dias)`);
    }

    // === 3. EXPIRAR LICENÇAS PAGAS NÃO RENOVADAS ===
    const expiredPaid = await prisma.license.findMany({
      where: {
        status: "active",
        expirationDate: { lt: now },
      },
      include: {
        companies: { select: { id: true, active: true } },
      },
    });

    for (const license of expiredPaid) {
      try {
        await prisma.license.update({
          where: { id: license.id },
          data: { status: "suspended", active: false },
        });
        for (const company of license.companies) {
          if (company.active) {
            await prisma.company.update({
              where: { id: company.id },
              data: { active: false },
            });
          }
        }
        stats.paymentExpired++;
        console.log(`[cron:expire-trials] Licença paga expirada: ${license.id}`);
      } catch (e) {
        stats.errors++;
      }
    }

    console.log(`[cron:expire-trials] ✓ Concluído:`, stats);
    return NextResponse.json({ success: true, ...stats, ranAt: now.toISOString() });
  } catch (error: any) {
    console.error("[cron:expire-trials] Erro fatal:", error);
    return NextResponse.json({ error: error.message, ...stats }, { status: 500 });
  }
}
