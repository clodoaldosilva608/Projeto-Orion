import Link from "next/link";
import DashboardLayout from "../../dashboard/layout";
import { PageHeader, Badge } from "@/components/ui-parts";
import { Layers, Star, Clock, DollarSign, Check } from "lucide-react";
import { listProjectTemplatesAction } from "@/lib/fabrica-actions";

export const dynamic = "force-dynamic";

function formatBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function TemplatesPage() {
  const { data: templates, error } = await listProjectTemplatesAction();
  const list = templates ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <PageHeader
          title="Catálogo de Templates"
          description="Templates reutilizáveis para acelerar o início de novos projetos. Cada template vem com stack padrão, features e estimativas."
          icon={Layers}
        />

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Total</div>
            <div className="text-2xl font-bold text-white mt-1">{list.length}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Oficiais</div>
            <div className="text-2xl font-bold text-violet-300 mt-1">
              {list.filter((t: any) => t.isOfficial).length}
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Categorias</div>
            <div className="text-2xl font-bold text-emerald-300 mt-1">
              {new Set(list.map((t: any) => t.category)).size}
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Uso total</div>
            <div className="text-2xl font-bold text-amber-300 mt-1">
              {list.reduce((acc: number, t: any) => acc + t.usageCount, 0)}
            </div>
          </div>
        </div>

        {/* Grid */}
        {list.length === 0 ? (
          <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4">
              <Layers className="h-8 w-8 text-[#6b7280]" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Nenhum template disponível</h3>
            <p className="text-sm text-[#8b8fa3]">Templates oficiais devem aparecer automaticamente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {list.map((t: any) => (
              <div
                key={t.id}
                className="glass-card p-5 flex flex-col gap-3 fade-in-up hover:border-violet-500/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl shrink-0"
                      style={{ backgroundColor: `${t.iconColor}22`, border: `1px solid ${t.iconColor}44` }}
                    >
                      {t.iconEmoji}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{t.displayName}</h3>
                      <p className="text-[10px] text-[#6b7280] uppercase tracking-wide">{t.category}</p>
                    </div>
                  </div>
                  {t.isOfficial && <Badge tone="violet">Oficial</Badge>}
                </div>

                <p className="text-xs text-[#c4c8d8] line-clamp-3">{t.description}</p>

                {/* Stack */}
                <div>
                  <div className="text-[10px] text-[#6b7280] uppercase tracking-wide mb-1">Stack</div>
                  <div className="flex flex-wrap gap-1">
                    {(t.stackDefault as string[]).slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="rounded-md bg-white/5 border border-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-violet-200"
                      >
                        {s}
                      </span>
                    ))}
                    {(t.stackDefault as string[]).length > 4 && (
                      <span className="text-[10px] text-[#6b7280] px-1 py-0.5">
                        +{(t.stackDefault as string[]).length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <div className="text-[10px] text-[#6b7280] uppercase tracking-wide mb-1">Features</div>
                  <div className="flex flex-wrap gap-1">
                    {(t.featuresDefault as string[]).slice(0, 3).map((f) => (
                      <span
                        key={f}
                        className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-300"
                      >
                        <Check className="h-2.5 w-2.5" /> {f}
                      </span>
                    ))}
                    {(t.featuresDefault as string[]).length > 3 && (
                      <span className="text-[10px] text-[#6b7280] px-1 py-0.5">
                        +{(t.featuresDefault as string[]).length - 3} mais
                      </span>
                    )}
                  </div>
                </div>

                {/* Estimativas */}
                <div className="flex items-center gap-4 pt-2 border-t border-white/[0.06] mt-auto">
                  <div className="inline-flex items-center gap-1 text-xs text-[#8b8fa3]">
                    <Clock className="h-3.5 w-3.5" />
                    {t.estimatedHours}h
                  </div>
                  <div className="inline-flex items-center gap-1 text-xs text-emerald-300 font-semibold">
                    <DollarSign className="h-3.5 w-3.5" />
                    {formatBRL(t.estimatedPriceCents)}
                  </div>
                  <div className="inline-flex items-center gap-1 text-xs text-[#6b7280] ml-auto">
                    <Star className="h-3 w-3" />
                    {t.usageCount} uso{t.usageCount !== 1 ? "s" : ""}
                  </div>
                </div>

                <Link
                  href={`/fabrica/projetos?template=${t.id}`}
                  className="inline-flex items-center justify-center gap-2 h-9 px-3 rounded-lg brand-gradient text-xs font-semibold text-white hover:opacity-95"
                >
                  Usar template
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
