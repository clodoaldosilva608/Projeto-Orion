/**
 * Email templates — SaaS Multi-Tenant
 */

import type { Company, User } from "@prisma/client";

type MailInput = { to: string; subject: string; html: string; text?: string };

/**
 * Envia email usando SMTP configurado.
 * Em dev, usa Ethereal (já configurado no .env).
 */
export async function sendEmail(input: MailInput): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      console.log("[email] SMTP não configurado — pulando envio para", input.to);
      return { ok: false, error: "SMTP não configurado" };
    }

    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: parseInt(process.env.SMTP_PORT || "587") === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "Orion <noreply@orion.com>",
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text || input.html.replace(/<[^>]+>/g, ""),
    });

    console.log(`[email] ✓ Enviado para ${input.to}: ${input.subject}`);
    return { ok: true };
  } catch (e: any) {
    console.error("[email] Erro:", e.message);
    return { ok: false, error: e.message };
  }
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://orion-saas-platform.vercel.app";

/**
 * Email de boas-vindas pós-signup.
 */
export function welcomeEmail(company: { tradeName: string; appName: string; subdomain: string | null }, userEmail: string, userName: string): MailInput {
  const loginUrl = `${APP_URL}/login`;
  return {
    to: userEmail,
    subject: `Bem-vindo ao ${company.appName}! Seu trial de 14 dias começou 🎉`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0b14; color: #e5e7eb; padding: 32px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #8b5cf6, #6366f1); border-radius: 12px; color: white; font-weight: bold; font-size: 18px;">${company.appName.toUpperCase()}</div>
        </div>
        <h1 style="color: white; font-size: 24px; margin-bottom: 16px;">Olá, ${userName}! 👋</h1>
        <p style="line-height: 1.6; color: #c4c8d8;">Sua conta no <strong style="color: white;">${company.appName}</strong> foi criada com sucesso. Você tem <strong style="color: #10b981;">14 dias grátis</strong> para explorar todas as funcionalidades — sem precisar de cartão de crédito.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${loginUrl}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Acessar minha conta →</a>
        </div>
        <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="margin: 0 0 8px; font-size: 12px; color: #8b8fa3; text-transform: uppercase; letter-spacing: 0.1em;">Detalhes da conta</p>
          <p style="margin: 0; color: #e5e7eb; font-size: 14px;">Empresa: <strong>${company.tradeName}</strong></p>
          <p style="margin: 4px 0 0; color: #e5e7eb; font-size: 14px;">Login: <strong>${userEmail}</strong></p>
        </div>
        <p style="font-size: 12px; color: #6b7280; margin-top: 32px;">Se você não criou esta conta, ignore este email.</p>
      </div>
    `,
  };
}

/**
 * Email de trial expirando (enviado 3 dias antes).
 */
export function trialExpiringEmail(company: { appName: string }, userEmail: string, userName: string, daysLeft: number): MailInput {
  const planosUrl = `${APP_URL}/planos`;
  return {
    to: userEmail,
    subject: `Seu trial expira em ${daysLeft} dias — não perca o acesso ⏰`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0b14; color: #e5e7eb; padding: 32px;">
        <h1 style="color: white; font-size: 22px;">${userName}, faltam ${daysLeft} dias</h1>
        <p style="line-height: 1.6; color: #c4c8d8;">Seu período de teste no <strong style="color: white;">${company.appName}</strong> termina em <strong style="color: #f59e0b;">${daysLeft} dias</strong>. Para continuar usando todas as funcionalidades sem interrupção, assine um plano.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${planosUrl}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #f59e0b, #fb923c); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Ver planos →</a>
        </div>
        <p style="font-size: 12px; color: #6b7280;">Você pode cancelar quando quiser. Sem multas.</p>
      </div>
    `,
  };
}

/**
 * Email de trial expirado.
 */
export function trialExpiredEmail(company: { appName: string }, userEmail: string, userName: string): MailInput {
  const planosUrl = `${APP_URL}/planos`;
  return {
    to: userEmail,
    subject: `Seu trial expirou — assine para voltar a usar 🔒`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0b14; color: #e5e7eb; padding: 32px;">
        <h1 style="color: white; font-size: 22px;">Seu período de teste acabou</h1>
        <p style="line-height: 1.6; color: #c4c8d8;">Olá ${userName}, seu trial de 14 dias no <strong style="color: white;">${company.appName}</strong> expirou. Seus dados estão preservados — basta assinar um plano para voltar a usar tudo normalmente.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${planosUrl}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Assinar agora →</a>
        </div>
        <p style="font-size: 12px; color: #6b7280;">Planos a partir de R$ 99/mês. Cancele quando quiser.</p>
      </div>
    `,
  };
}

/**
 * Email de assinatura cancelada.
 */
export function subscriptionCanceledEmail(company: { appName: string }, userEmail: string, userName: string): MailInput {
  const loginUrl = `${APP_URL}/login`;
  return {
    to: userEmail,
    subject: `Assinatura cancelada — acesso suspenso`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0b14; color: #e5e7eb; padding: 32px;">
        <h1 style="color: white; font-size: 22px;">Assinatura cancelada</h1>
        <p style="line-height: 1.6; color: #c4c8d8;">Olá ${userName}, sua assinatura do <strong style="color: white;">${company.appName}</strong> foi cancelada e o acesso está suspenso. Seus dados continuam preservados por 90 dias.</p>
        <p style="line-height: 1.6; color: #c4c8d8;">Para reativar, basta assinar um novo plano:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${loginUrl}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Reativar conta →</a>
        </div>
      </div>
    `,
  };
}
