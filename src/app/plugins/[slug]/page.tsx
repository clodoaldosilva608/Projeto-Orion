import Link from "next/link";
import { notFound } from "next/navigation";
import DashboardLayout from "../../dashboard/layout";
import { PageHeader, Badge } from "@/components/ui-parts";
import { ArrowLeft, Package, Download, CheckCircle2, Star, Globe, BookOpen } from "lucide-react";
import { getPluginAction } from "@/lib/plugins-actions";
import { getCategoryLabel } from "@/lib/plugins-helpers";
import { PluginActions } from "./PluginActions";

export const dynamic = "force-dynamic";

export default async function PluginDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data: plugin, error } = await getPluginAction(slug);

  if (error || !plugin) {
    notFound();
  }

  const p: any = plugin;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1100px] mx-auto">
        <Link
          href="/plugins"
          className="inline-flex items-center gap-1.5 text-xs text-[#8b8fa3] hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar ao marketplace
        </Link>

        <PageHeader
          title={p.displayName}
          description={`v${p.version} · por ${p.author}`}
          icon={Package}
        />

        {/* Hero card */}
        <div className="glass-card p-6 flex flex-col sm:flex-row gap-5 items-start">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl shrink-0"
            style={{ backgroundColor: `${p.iconColor}22`, border: `2px solid ${p.iconColor}44` }}
          >
            {p.iconEmoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {p.isOfficial && <Badge tone="violet">Oficial Orion</Badge>}
              <Badge tone="info">{getCategoryLabel(p.category)}</Badge>
              {p.isFree ? <Badge tone="success">Gratuito</Badge> : <Badge tone="warning">R$ {(p.priceCents / 100).toFixed(2)}</Badge>}
            </div>
            <p className="text-sm text-[#c4c8d8] mb-4">{p.description}</p>
            <div className="flex items-center gap-4 text-xs text-[#8b8fa3]">
              <span className="inline-flex items-center gap-1">
                <Download className="h-3.5 w-3.5" />
                {p.installCount} instalações
              </span>
              {p.rating != null && (
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-amber-300" />
                  {p.rating.toFixed(1)} ({p.ratingCount} avaliações)
                </span>
              )}
              {p.homepageUrl && (
                <a href={p.homepageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-violet-300">
                  <Globe className="h-3.5 w-3.5" /> Homepage
                </a>
              )}
              {p.docsUrl && (
                <a href={p.docsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-violet-300">
                  <BookOpen className="h-3.5 w-3.5" /> Docs
                </a>
              )}
            </div>
          </div>
          <PluginActions
            slug={p.slug}
            displayName={p.displayName}
            isInstalled={p.isInstalled}
            installation={p.installation}
            configSchema={p.configSchema}
            defaultConfig={p.defaultConfig}
          />
        </div>

        {/* Events supported */}
        {p.eventsSupported.length > 0 && (
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Eventos suportados</h3>
            <div className="flex flex-wrap gap-2">
              {p.eventsSupported.map((e: string) => (
                <span
                  key={e}
                  className="rounded-md bg-violet-500/10 border border-violet-500/20 px-2 py-1 font-mono text-xs text-violet-200"
                >
                  {e}
                </span>
              ))}
            </div>
            <p className="text-xs text-[#6b7280] mt-3">
              Estes eventos disparam webhooks e podem ser configurados em Configurações → Webhooks.
            </p>
          </div>
        )}

        {/* Configuration schema */}
        {p.configSchema && Object.keys(p.configSchema).length > 0 && (
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-1">Schema de configuração</h3>
            <p className="text-xs text-[#6b7280] mb-3">
              Campos necessários para configurar o plugin após instalação.
            </p>
            <div className="space-y-2">
              {Object.entries(p.configSchema).map(([key, schema]: [string, any]) => (
                <div key={key} className="flex items-start gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono text-violet-200">{key}</div>
                    <div className="text-xs text-[#c4c8d8] mt-0.5">{schema.label}</div>
                    <div className="text-[10px] text-[#6b7280] mt-0.5">
                      tipo: <span className="font-mono">{schema.type}</span>
                      {schema.required && <span className="text-amber-300"> · obrigatório</span>}
                      {schema.options && <span> · opções: {schema.options.join(", ")}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API usage example */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-2">Como usar via API pública</h3>
          <p className="text-xs text-[#6b7280] mb-3">
            Após instalar, este plugin reage a eventos da plataforma. Você também pode chamar a API pública diretamente:
          </p>
          <pre className="text-xs font-mono text-emerald-200 bg-black/30 rounded-lg p-3 overflow-x-auto">
{`# Exemplo: listar metas via API
curl -H "Authorization: Bearer orion_live_xxx" \\
  https://orion-saas-phi.vercel.app/api/v1/public/goals

# Endpoints disponíveis:
# GET /api/v1/public/goals      — listar metas
# GET /api/v1/public/results    — listar resultados aprovados
# GET /api/v1/public/campaigns  — listar campanhas
# GET /api/v1/public/users      — listar usuários
# GET /api/v1/public/leaderboard?period=month — ranking de pontos`}
          </pre>
          <Link
            href="/plugins/api-keys"
            className="inline-flex items-center gap-1.5 mt-3 text-xs text-violet-300 hover:text-violet-200"
          >
            Gerar API key →
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
