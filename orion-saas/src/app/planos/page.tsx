import DashboardLayout from "../dashboard/layout";
import { Check, Rocket, Crown, Building2, Sparkles } from "lucide-react";
import { PLANS } from "@/lib/stripe";

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
    <DashboardLayout>
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">Planos</h1>
          <p className="text-sm mt-2 text-secondary">Escolha o plano ideal para sua equipe</p>
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
                <p className="text-xs text-muted mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-sm text-muted">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-secondary">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <form action="/api/stripe/checkout" method="POST">
                  <input type="hidden" name="plan" value={plan.slug} />
                  <button type="submit" className={plan.highlight ? "btn-primary w-full" : "btn-ghost w-full"}>{plan.cta}</button>
                </form>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
