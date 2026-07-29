import Link from "next/link";
import { Check, Rocket, Crown, Building2, Sparkles, ArrowLeft } from "lucide-react";
import { PLANS } from "@/lib/stripe";
import { PlanCheckoutButton } from "./PlanCheckoutButton";

export const dynamic = "force-dynamic";

const PLAN_DETAILS = [
  {
    slug: "free" as const, name: "Free", icon: Sparkles, color: "#6b7280", bg: "rgba(107,114,128,0.1)",
    price: "R$ 0", period: "/mês", description: "Para testar a plataforma",
    features: ["5 usuários", "1 filial", "10 indicadores", "Dashboard básico", "Suporte por email"],
    cta: "Começar grátis", highlight: false,
  },
  {
    slug: "starter" as const, name: "Starter", icon: Rocket, color: "#6366f1", bg: "rgba(99,102,241,0.1)",
    price: "R$ 99", period: "/mês", description: "Para pequenas equipes",
    features: ["15 usuários", "3 filiais", "50 indicadores", "Dashboard avançado", "Ranking gamificado", "Suporte prioritário"],
    cta: "Assinar Starter", highlight: false,
  },
  {
    slug: "pro" as const, name: "Pro", icon: Crown, color: "#8b5cf6", bg: "rgba(139,92,246,0.1)",
    price: "R$ 299", period: "/mês", description: "Para equipes em crescimento",
    features: ["50 usuários", "10 filiais", "200 indicadores", "IA integrada", "Workflow de aprovação", "Campanhas", "API access"],
    cta: "Assinar Pro", highlight: true,
  },
  {
    slug: "enterprise" as const, name: "Enterprise", icon: Building2, color: "#f59e0b", bg: "rgba(245,158,11,0.1)",
    price: "R$ 499", period: "/mês", description: "Para grandes operações",
    features: ["500 usuários", "100 filiais", "Indicadores ilimitados", "IA avançada", "SSO/SAML", "SLA 99.9%", "Gerente dedicado", "On-premise option"],
    cta: "Falar com vendas", highlight: false,
  },
];

export default function PlanosPage() {
  return (
    <div className="min-h-screen bg-[#0a0b14] text-white p-4 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-[#c4c8d8] hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao painel
          </Link>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">Planos & Assinatura</h1>
          <p className="text-sm mt-2 text-[#8b8fa3]">
            Escolha o plano ideal para sua equipe. Cancele quando quiser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLAN_DETAILS.map((plan) => {
            const Icon = plan.icon;
            return (
              <div key={plan.slug} className="glass-card p-6 relative" style={plan.highlight ? { border: "1px solid rgba(139,92,246,0.3)" } : {}}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-tiny font-bold text-white" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                    MAIS POPULAR
                  </div>
                )}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: plan.bg }}>
                  <Icon className="w-6 h-6" style={{ color: plan.color }} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
                <p className="text-xs text-[#8b8fa3] mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-sm text-[#8b8fa3]">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[#c4c8d8]">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                {plan.slug === "free" ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center w-full h-10 rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-[#c4c8d8] hover:text-white"
                  >
                    {plan.cta}
                  </Link>
                ) : (
                  <PlanCheckoutButton plan={plan.slug} cta={plan.cta} highlight={plan.highlight} />
                )}
              </div>
            );
          })}
        </div>

        {/* Help block */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-2">ℹ️ Como funciona a cobrança</h3>
          <ul className="text-xs text-[#8b8fa3] space-y-1.5">
            <li>• Pagamento processado pelo <strong className="text-white">Stripe</strong> — ambiente seguro e criptografado.</li>
            <li>• Aceita cartões de crédito internacionais e nacionais.</li>
            <li>• Após o pagamento, sua licença é <strong className="text-white">ativada automaticamente</strong> em segundos.</li>
            <li>• Cancele quando quiser pelo botão <strong className="text-white">Gerenciar Assinatura</strong> no painel.</li>
            <li>• Módulos pagos (Orion Gestão Comercial, IA, etc.) são liberados conforme o plano contratado.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
