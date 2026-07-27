import Link from "next/link";
import DashboardLayout from "../dashboard/layout";
import { PageHeader, Badge } from "@/components/ui-parts";
import { Package, Search, Star, Download, CheckCircle2, Settings2 } from "lucide-react";
import { listPluginsAction } from "@/lib/plugins-actions";
import { PLUGIN_CATEGORIES, getCategoryLabel } from "@/lib/plugins-helpers";
import { InstallButton, PluginSearch, CategoryFilter } from "./PluginsClient";

export const dynamic = "force-dynamic";

export default async function PluginsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const category = (params.category as string) || "all";
  const search = (params.search as string) || "";
  const installedOnly = params.installed === "1";

  const { data: plugins, error } = await listPluginsAction({
    category,
    search,
    installedOnly,
  });
  const list = plugins ?? [];

  const installedCount = list.filter((p: any) => p.isInstalled).length;
  const officialCount = list.filter((p: any) => p.isOfficial).length;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <PageHeader
          title="Marketplace de Plugins"
          description="Instale plugins oficiais para integrar WhatsApp, Telegram, CRM, Estoque, Comissões e mais."
          icon={Package}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Disponíveis</div>
            <div className="text-2xl font-bold text-white mt-1">{list.length}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Oficiais</div>
            <div className="text-2xl font-bold text-violet-300 mt-1">{officialCount}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Instalados</div>
            <div className="text-2xl font-bold text-emerald-300 mt-1">{installedCount}</div>
          </div>
          <Link href="/plugins/api-keys" className="glass-card p-4 hover:border-violet-500/30 transition-colors block">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">API Keys</div>
            <div className="text-2xl font-bold text-amber-300 mt-1">Gerenciar →</div>
          </Link>
        </div>

        {/* Search + filter */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <PluginSearch initialSearch={search} />
          <CategoryFilter current={category} />
          <Link
            href={`/plugins?installed=1${category !== "all" ? `&category=${category}` : ""}${search ? `&search=${search}` : ""}`}
            className={`inline-flex items-center gap-2 h-10 px-4 rounded-lg text-xs font-medium transition-colors ${
              installedOnly
                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                : "border border-white/10 bg-white/5 text-[#8b8fa3] hover:text-white"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {installedOnly ? "Mostrando instalados" : "Só instalados"}
          </Link>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Plugin grid */}
        {list.length === 0 ? (
          <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-[#6b7280]" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Nenhum plugin encontrado</h3>
            <p className="text-sm text-[#8b8fa3]">Tente ajustar os filtros ou limpar a busca.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {list.map((p: any) => (
              <div
                key={p.id}
                className="glass-card p-5 flex flex-col gap-3 fade-in-up hover:border-violet-500/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl text-2xl shrink-0"
                      style={{ backgroundColor: `${p.iconColor}22`, border: `1px solid ${p.iconColor}44` }}
                    >
                      {p.iconEmoji}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-white truncate">{p.displayName}</h3>
                      <p className="text-xs text-[#8b8fa3]">{p.author}</p>
                    </div>
                  </div>
                  {p.isOfficial && (
                    <Badge tone="violet">Oficial</Badge>
                  )}
                </div>

                <p className="text-xs text-[#c4c8d8] line-clamp-3">{p.description}</p>

                <div className="flex items-center gap-3 text-xs text-[#8b8fa3]">
                  <span className="inline-flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    {getCategoryLabel(p.category)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    {p.installCount} installs
                  </span>
                  {p.rating != null && (
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-300" />
                      {p.rating.toFixed(1)}
                    </span>
                  )}
                </div>

                {p.eventsSupported.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {p.eventsSupported.slice(0, 3).map((e: string) => (
                      <span
                        key={e}
                        className="rounded-md bg-white/5 border border-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-violet-200"
                      >
                        {e}
                      </span>
                    ))}
                    {p.eventsSupported.length > 3 && (
                      <span className="text-[10px] text-[#6b7280] px-1 py-0.5">
                        +{p.eventsSupported.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06] mt-auto">
                  <Link
                    href={`/plugins/${p.slug}`}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-[#c4c8d8] hover:text-white hover:bg-white/10 transition-colors flex-1 justify-center"
                  >
                    <Search className="h-3.5 w-3.5" />
                    Detalhes
                  </Link>
                  {p.isInstalled ? (
                    <>
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-300 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Instalado
                      </span>
                      <Link
                        href={`/plugins/${p.slug}`}
                        className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-[#8b8fa3] hover:text-white hover:bg-white/5 transition-colors"
                        title="Configurar"
                      >
                        <Settings2 className="h-4 w-4" />
                      </Link>
                    </>
                  ) : (
                    <InstallButton slug={p.slug} name={p.displayName} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
