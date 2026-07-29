"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Package, ExternalLink, Lock, Loader2, CreditCard, Settings,
  LifeBuoy, MessageSquare, Mail, ArrowUpRight, Check, Sparkles
} from "lucide-react";
import Link from "next/link";

type Product = {
  moduleKey: string;
  moduleName: string;
  moduleDescription: string;
  moduleIcon: string;
  moduleColor: string;
  deployUrl: string | null;
  enabled: boolean;
};

type Props = {
  companyId: string;
  companyTradeName: string;
  companyInitial: string;
  primaryColor: string;
  plan: string;
  trialDaysLeft?: number;
  trialStatus?: string;
  stripeCustomerId: string | null;
  products: Product[];
};

export function MinimalDashboard({
  companyId, companyTradeName, companyInitial, primaryColor, plan,
  trialDaysLeft, trialStatus, stripeCustomerId, products,
}: Props) {
  const router = useRouter();
  const [portalLoading, setPortalLoading] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enabledProducts = products.filter(p => p.enabled);
  const disabledProducts = products.filter(p => !p.enabled);

  const handleOpenProduct = async (product: Product) => {
    if (!product.enabled) {
      router.push(`/planos?reason=module_locked&module=${product.moduleKey}`);
      return;
    }
    if (!product.deployUrl) {
      // Internal modules
      const internalRoutes: Record<string, string> = {
        fabrica: "/fabrica",
        vendas: "/vendas",
        ia: "/ia",
        deploy: "/deployments",
        calendario: "/calendario",
      };
      const route = internalRoutes[product.moduleKey];
      if (route) router.push(route);
      return;
    }
    // External product (ex: Orion Gestão Comercial) — gera token SSO e abre
    // O endpoint /api/sso/paguemenos-token retorna URL com JWT
    // que o Orion Gestão Comercial valida em /api/sso para login automático
    if (product.moduleKey === "paguemenos") {
      // SSO cross-app: gera JWT e redireciona
      // Se o usuário não existir na instância de destino, ele verá a tela
      // de login com a mensagem de provisionamento
      try {
        const res = await fetch("/api/sso/paguemenos-token");
        const data = await res.json();
        if (data.url) {
          window.open(data.url, "_blank", "noopener,noreferrer");
          return;
        }
        if (data.error) {
          alert("Sua instância está sendo provisionada. Você receberá um email quando estiver pronta.");
          return;
        }
      } catch (e) {
        console.error("SSO error:", e);
        alert("Não foi possível conectar à sua instância. Tente novamente em alguns instantes.");
      }
      return;
    }
    // Outros produtos externos
    const url = new URL(product.deployUrl);
    url.searchParams.set("companyId", companyId);
    url.searchParams.set("from", "orion");
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erro"); return; }
      if (data.url) window.location.href = data.url;
    } catch (e: any) { setError(e.message); }
    finally { setPortalLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0a0b14] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 lg:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white shadow-lg"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}
            >
              {companyInitial}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{companyTradeName}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                {trialStatus === "trial" && trialDaysLeft !== undefined && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300">
                    Trial · {trialDaysLeft} dias restantes
                  </span>
                )}
                {trialStatus === "active" && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 capitalize">
                    Plano {plan}
                  </span>
                )}
                <span className="text-[10px] text-[#6b7280]">Painel do cliente</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowContact(!showContact)}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-[#c4c8d8] hover:text-white"
          >
            <LifeBuoy className="h-3.5 w-3.5" /> Suporte
          </button>
        </div>

        {/* Contact panel (collapsible) */}
        {showContact && (
          <div className="glass-card p-5 mb-6 fade-in-up">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-violet-300" /> Precisa de ajuda?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a href="mailto:suporte@orion.com?subject=Suporte%20-%20{companyTradeName}"
                className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/15">
                  <Mail className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Email</div>
                  <div className="text-[10px] text-[#8b8fa3]">suporte@orion.com</div>
                </div>
              </a>
              <a href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20preciso%20de%20suporte%20no%20Orion"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15">
                  <MessageSquare className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">WhatsApp</div>
                  <div className="text-[10px] text-[#8b8fa3]">Resposta em até 2h</div>
                </div>
              </a>
            </div>
          </div>
        )}

        {/* Meus Produtos */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Package className="h-4 w-4 text-violet-300" /> Meus Produtos
            <span className="text-[10px] text-[#6b7280] font-normal">
              {enabledProducts.length} ativo(s)
            </span>
          </h2>

          {enabledProducts.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <Package className="h-10 w-10 text-[#6b7280] mx-auto mb-3" />
              <p className="text-sm text-[#8b8fa3] mb-4">
                Você ainda não tem produtos ativos.
              </p>
              <Link href="/produtos" className="inline-flex items-center gap-2 h-9 px-4 rounded-lg brand-gradient text-xs font-semibold text-white">
                Ver produtos disponíveis <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {enabledProducts.map((p) => (
                <button
                  key={p.moduleKey}
                  onClick={() => handleOpenProduct(p)}
                  className="group w-full text-left glass-card p-5 hover:border-white/20 transition-all"
                  style={{ borderColor: `${p.moduleColor}33` }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-xl text-2xl shrink-0"
                      style={{ backgroundColor: `${p.moduleColor}22`, color: p.moduleColor }}
                    >
                      {p.moduleIcon.trim()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-white">{p.moduleName}</h3>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-500/15 px-1.5 py-0.5 rounded">
                          <Check className="h-3 w-3" /> Ativo
                        </span>
                      </div>
                      <p className="text-xs text-[#8b8fa3] mt-0.5 line-clamp-1">{p.moduleDescription}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[11px] font-medium" style={{ color: p.moduleColor }}>
                          {p.deployUrl ? "Abrir aplicação" : "Acessar módulo"} →
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-[#6b7280] group-hover:text-white transition-colors shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Produtos disponíveis para assinar */}
        {disabledProducts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-300" /> Produtos disponíveis
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {disabledProducts.map((p) => (
                <button
                  key={p.moduleKey}
                  onClick={() => router.push("/produtos")}
                  className="group text-left glass-card p-4 opacity-70 hover:opacity-100 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-base"
                      style={{ backgroundColor: `${p.moduleColor}22`, color: p.moduleColor }}
                    >
                      {p.moduleIcon.trim()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <h3 className="text-sm font-semibold text-white">{p.moduleName}</h3>
                        <Lock className="h-3 w-3 text-[#6b7280]" />
                      </div>
                      <p className="text-[10px] text-[#8b8fa3] mt-0.5">Saiba mais</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Assinatura */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-violet-300" /> Assinatura
          </h3>
          {error && (
            <div className="mb-3 text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
              {error}
            </div>
          )}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-xs text-[#8b8fa3]">
              <div className="flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5" />
                <span>
                  {trialStatus === "trial"
                    ? `Trial gratuito — ${trialDaysLeft} dias restantes`
                    : trialStatus === "active"
                    ? `Plano ${plan} ativo`
                    : "Sem assinatura ativa"}
                </span>
              </div>
              {stripeCustomerId && (
                <div className="mt-0.5 text-[10px] text-[#6b7280]">
                  ID Stripe: {stripeCustomerId.substring(0, 16)}…
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/planos"
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-white/10 bg-white/5 text-[11px] font-medium text-[#c4c8d8] hover:text-white"
              >
                <Settings className="h-3.5 w-3.5" /> Ver planos
              </Link>
              {stripeCustomerId && (
                <button
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg brand-gradient text-[11px] font-semibold text-white disabled:opacity-50"
                >
                  {portalLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CreditCard className="h-3.5 w-3.5" />}
                  Gerenciar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
          <p className="text-[10px] text-[#6b7280]">
            Orion Platform · Painel do Cliente ·{" "}
            <Link href="/configuracoes" className="text-violet-300 hover:text-violet-200">Configurações</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
