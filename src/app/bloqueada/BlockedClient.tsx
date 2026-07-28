"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Clock, CreditCard, AlertTriangle, ArrowRight, Mail } from "lucide-react";

const REASONS: Record<string, { title: string; message: string; icon: any; color: string }> = {
  trial_expired: {
    title: "Seu período de teste acabou",
    message: "Seus 14 dias grátis terminaram. Para continuar usando todas as funcionalidades e acessar seus dados, assine um plano. Cancelamento a qualquer momento.",
    icon: Clock,
    color: "#f59e0b",
  },
  canceled: {
    title: "Assinatura cancelada",
    message: "Sua assinatura foi cancelada e o acesso está suspenso. Seus dados estão preservados. Reative sua assinatura para voltar a usar.",
    icon: Lock,
    color: "#ef4444",
  },
  suspended: {
    title: "Conta suspensa",
    message: "Sua conta foi suspensa. Entre em contato com nosso suporte para regularizar ou ative uma assinatura para liberar o acesso.",
    icon: AlertTriangle,
    color: "#f59e0b",
  },
  expired: {
    title: "Assinatura expirada",
    message: "Sua assinatura expirou. Renove para voltar a usar a plataforma com todos os seus dados preservados.",
    icon: Lock,
    color: "#ef4444",
  },
  payment_failed: {
    title: "Pagamento falhou",
    message: "Não conseguimos processar seu último pagamento. Atualize seu método de pagamento para evitar a suspensão.",
    icon: CreditCard,
    color: "#ef4444",
  },
};

export function BlockedClient() {
  const params = useSearchParams();
  const reason = params.get("reason") || "trial_expired";
  const config = REASONS[reason] || REASONS.trial_expired;
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-[#0a0b14] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center fade-in-up">
        <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full mb-6" style={{ background: `${config.color}22` }}>
          <Icon className="h-10 w-10" style={{ color: config.color }} />
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">{config.title}</h1>
        <p className="text-sm text-[#8b8fa3] mb-8 leading-relaxed">{config.message}</p>

        <div className="space-y-3">
          <Link
            href="/planos"
            className="w-full h-12 rounded-lg brand-gradient text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-95 inline-flex items-center justify-center gap-2"
          >
            Ver planos e assinar <ArrowRight className="h-4 w-4" />
          </Link>

          <a
            href="mailto:suporte@orion.com?subject=Acesso%20bloqueado%20-%20${reason}"
            className="w-full h-11 rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-[#c4c8d8] hover:text-white inline-flex items-center justify-center gap-2"
          >
            <Mail className="h-4 w-4" /> Falar com suporte
          </a>
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.06]">
          <p className="text-[10px] text-[#6b7280]">
            💾 Seus dados estão preservados. Após assinar, você terá acesso a tudo novamente.
          </p>
        </div>

        <Link href="/login" className="mt-6 inline-block text-xs text-[#6b7280] hover:text-white">
          ← Voltar para o login
        </Link>
      </div>
    </div>
  );
}
