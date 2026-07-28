"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  Lock,
  Loader2,
  CreditCard,
  Package,
  ArrowUpRight,
  Settings,
} from "lucide-react";

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
  plan: string;
  stripeCustomerId: string | null;
  products: Product[];
};

export function MyProductsCard({
  companyId,
  companyTradeName,
  plan,
  stripeCustomerId,
  products,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenProduct = (product: Product) => {
    if (!product.enabled) {
      router.push(`/planos?reason=module_locked&module=${product.moduleKey}`);
      return;
    }
    if (!product.deployUrl) {
      // Módulo interno — navega dentro do próprio Orion
      if (product.moduleKey === "fabrica") router.push("/fabrica");
      else if (product.moduleKey === "vendas") router.push("/vendas");
      else if (product.moduleKey === "ia") router.push("/ia");
      else if (product.moduleKey === "deploy") router.push("/deployments");
      else if (product.moduleKey === "calendario") router.push("/calendario");
      return;
    }
    // Abre deploy externo passando companyId como query param (cookie é setado
    // no deploy do PagueMenos em uma rota /api/auth/sso separada)
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
      if (!res.ok) {
        setError(data.error || "Erro ao abrir portal de cobrança");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setPortalLoading(false);
    }
  };

  const enabledCount = products.filter((p) => p.enabled).length;

  return (
    <div className="glass-card p-5 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-violet-300" />
          <h3 className="text-sm font-semibold text-white">Meus Produtos</h3>
          <span className="text-[10px] text-[#8b8fa3] uppercase tracking-wide">
            {enabledCount}/{products.length} ativos
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#6b7280]">Plano:</span>
          <span className="text-xs font-semibold capitalize text-violet-200 bg-violet-500/10 px-2 py-0.5 rounded">
            {plan}
          </span>
        </div>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {products.map((p) => (
          <button
            key={p.moduleKey}
            onClick={() => handleOpenProduct(p)}
            className={`group relative text-left rounded-lg border p-3 transition-all ${
              p.enabled
                ? "bg-white/[0.03] border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.05]"
                : "bg-white/[0.01] border-white/[0.04] opacity-60 hover:opacity-80"
            }`}
            style={
              p.enabled
                ? {
                    borderColor: `${p.moduleColor}33`,
                    backgroundColor: `${p.moduleColor}08`,
                  }
                : {}
            }
          >
            <div className="flex items-start justify-between gap-2">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-md text-base"
                style={{
                  backgroundColor: `${p.moduleColor}22`,
                  color: p.moduleColor,
                }}
              >
                {p.moduleIcon.trim()}
              </div>
              {p.enabled ? (
                <ArrowUpRight className="h-4 w-4 text-[#6b7280] group-hover:text-white transition-colors" />
              ) : (
                <Lock className="h-4 w-4 text-[#6b7280]" />
              )}
            </div>
            <div className="mt-2 text-xs font-semibold text-white">
              {p.moduleName}
            </div>
            <div className="text-[10px] text-[#8b8fa3] line-clamp-2 mt-0.5">
              {p.enabled ? p.moduleDescription : "Módulo bloqueado — faça upgrade do plano"}
            </div>
            <div className="mt-2 pt-2 border-t border-white/[0.04] flex items-center justify-between">
              <span
                className="text-[10px] font-medium"
                style={{ color: p.enabled ? p.moduleColor : "#6b7280" }}
              >
                {p.enabled ? "Acessar →" : "Desbloquear →"}
              </span>
              {p.deployUrl && p.enabled && (
                <ExternalLink className="h-3 w-3 text-[#6b7280]" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Footer — Manage Subscription */}
      <div className="mt-5 pt-4 border-t border-white/[0.06]">
        {error && (
          <div className="mb-3 text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
            {error}
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-xs text-[#8b8fa3]">
            <div className="flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" />
              <span>Assinatura Stripe</span>
              {stripeCustomerId ? (
                <span className="text-emerald-400 font-mono text-[10px]">
                  • {stripeCustomerId.substring(0, 12)}…
                </span>
              ) : (
                <span className="text-amber-400 text-[10px]">• Sem assinatura ativa</span>
              )}
            </div>
            <div className="mt-0.5 text-[10px] text-[#6b7280]">
              Empresa: {companyTradeName}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/planos")}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-white/10 bg-white/5 text-[11px] font-medium text-[#c4c8d8] hover:text-white"
            >
              <Settings className="h-3.5 w-3.5" />
              Ver Planos
            </button>
            {stripeCustomerId && (
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg brand-gradient text-[11px] font-semibold text-white shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {portalLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CreditCard className="h-3.5 w-3.5" />
                )}
                Gerenciar Assinatura
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
