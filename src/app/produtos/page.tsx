import Link from "next/link";
import { Sparkles, ArrowLeft, Check, ExternalLink, ShoppingCart, Tag } from "lucide-react";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  gestao_comercial: "Gestão Comercial",
  saude: "Saúde",
  financas: "Finanças",
  educacao: "Educação",
  fitness: "Fitness",
  logistica: "Logística",
  varejo: "Varejo",
  ia_dados: "IA & Dados",
};

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
}

export default async function ProdutosPage() {
  const products = await prisma.product.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0a0b14]/70 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao início
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg brand-gradient">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold brand-text">ORION</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted mb-4">
            <Tag className="h-3.5 w-3.5 text-violet-300" />
            Catálogo de produtos
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Aplicações prontas para o seu negócio
          </h1>
          <p className="mt-4 text-muted">
            Adquira uma aplicação Orion e receba sua própria instância com subdomínio,
            personalização de marca e dados isolados. Pagamento recorrente via Stripe.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <p className="text-muted">Nenhum produto disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {products.map((p) => {
              const features = Array.isArray(p.features) ? p.features.filter((x): x is string => typeof x === "string") : [];
              const category = CATEGORY_LABELS[p.category] ?? p.category;
              return (
                <div key={p.id} className="glass-card glass-card-hover p-6 lg:p-8 h-full flex flex-col">
                  <div className="flex-1 rounded-xl flex items-center justify-center min-h-[180px] relative overflow-hidden mb-6"
                    style={{ background: `linear-gradient(135deg, ${p.iconColor}cc, ${p.iconColor}66)` }}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_50%)]" />
                    <div className="relative text-center">
                      <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-white/20 backdrop-blur mb-3">
                        <ShoppingCart className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-2xl font-bold text-white">{p.name}</p>
                      <p className="text-sm text-white/80 mt-1">{category}</p>
                    </div>
                  </div>

                  <h2 className="text-xl font-semibold text-white">{p.name}</h2>
                  {p.description && <p className="mt-2 text-sm text-muted">{p.description}</p>}

                  {features.length > 0 && (
                    <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 flex-1">
                      {features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                            <Check className="h-3 w-3" />
                          </span>
                          <span className="text-white/85">{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-6">
                    <p className="text-sm text-muted">A partir de</p>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-bold text-white">{formatBRL(p.priceCents)}</span>
                      <span className="text-sm text-muted mb-1">/ implantação</span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    {p.demoUrl && (
                      <a href={p.demoUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 h-11 text-sm font-semibold text-white hover:bg-white/10">
                        <ExternalLink className="h-4 w-4" />
                        Ver demonstração
                      </a>
                    )}
                    <Link href={`/produtos/${p.slug}/comprar`}
                      className="inline-flex items-center justify-center gap-2 rounded-lg brand-gradient px-5 h-11 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-95">
                      <ShoppingCart className="h-4 w-4" />
                      Adquirir agora
                    </Link>
                  </div>
                  {p.demoUrl && (
                    <p className="mt-3 text-[11px] text-muted/70">
                      Demo: {p.demoUrl.replace(/^https?:\/\//, "")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">Em breve</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-60">
            {["BioSaúde", "FIManager", "LogTrack"].map((p) => (
              <div key={p} className="glass-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-muted mb-3">
                  <Sparkles className="h-5 w-5" />
                </div>
                <p className="text-base font-semibold text-white">{p}</p>
                <p className="text-xs text-muted mt-1">Em desenvolvimento</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
