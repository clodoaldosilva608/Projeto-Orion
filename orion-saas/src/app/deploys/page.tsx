import DashboardLayout from "../dashboard/layout";
import { Rocket, Plus, ExternalLink, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { PageHeader, PageButton, Badge } from "@/components/ui-parts";

export const dynamic = "force-dynamic";

const DEPLOYS = [
  { project: "PagueMenos", environment: "Produção", status: "Publicado", url: "projeto-paguemenos.vercel.app", date: "26/07/2025, 14:22" },
  { project: "BioSaúde", environment: "Homologação", status: "Publicado", url: "biosaude-homolog.vercel.app", date: "26/07/2025, 11:05" },
  { project: "FIManager", environment: "Preview", status: "Pendente", url: "fimanager-pr-84.vercel.app", date: "Em fila" },
  { project: "MarketPro", environment: "Produção", status: "Publicado", url: "marketpro.vercel.app", date: "25/07/2025, 18:40" },
  { project: "LogTrack", environment: "Homologação", status: "Falhou", url: "logtrack-homolog.vercel.app", date: "25/07/2025, 16:30" },
  { project: "EduSmart", environment: "Produção", status: "Publicado", url: "edusmart.vercel.app", date: "24/07/2025, 10:00" },
  { project: "HealthPlus", environment: "Preview", status: "Publicado", url: "healthplus-pr-12.vercel.app", date: "23/07/2025, 14:33" },
  { project: "AgroTech", environment: "Produção", status: "Publicado", url: "agrotech.vercel.app", date: "22/07/2025, 09:18" },
];

const STATUS_META: Record<string, { tone: "success" | "warning" | "danger"; icon: typeof CheckCircle2 }> = {
  Publicado: { tone: "success", icon: CheckCircle2 },
  Pendente: { tone: "warning", icon: Clock },
  Falhou: { tone: "danger", icon: AlertCircle },
};

const ENV_TONE: Record<string, "danger" | "warning" | "info"> = {
  Produção: "danger",
  Homologação: "warning",
  Preview: "info",
};

export default function DeploysPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Deploys"
          description="Deploys das aplicações em todos os ambientes."
          icon={Rocket}
          action={<PageButton><Plus className="h-4 w-4" />Novo Deploy</PageButton>}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { l: "Deploys no Mês", v: "642", c: "+14,2% vs mês anterior" },
            { l: "Em Produção", v: "278", c: "43,3% do total" },
            { l: "Taxa de Sucesso", v: "96,8%", c: "+0,8pp vs mês anterior" },
            { l: "Tempo Médio", v: "1m 48s", c: "-8s vs mês anterior" },
          ].map((s) => (
            <div key={s.l} className="glass-card glass-card-hover p-5">
              <p className="text-sm text-[#8b8fa3]">{s.l}</p>
              <p className="text-2xl font-bold text-white mt-1">{s.v}</p>
              <p className="text-xs text-emerald-400 mt-1.5">{s.c}</p>
            </div>
          ))}
        </div>

        <div className="glass-card p-5 lg:p-6">
          <h3 className="text-base font-semibold text-white mb-4">Histórico de Deploys</h3>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#6b7280] border-b border-white/5">
                  <th className="font-medium px-2 pb-3">Projeto</th>
                  <th className="font-medium px-2 pb-3">Ambiente</th>
                  <th className="font-medium px-2 pb-3">Status</th>
                  <th className="font-medium px-2 pb-3">URL</th>
                  <th className="font-medium px-2 pb-3">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {DEPLOYS.map((d, i) => {
                  const meta = STATUS_META[d.status];
                  const Icon = meta.icon;
                  return (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      <td className="px-2 py-3 text-sm font-semibold text-white">{d.project}</td>
                      <td className="px-2 py-3"><Badge tone={ENV_TONE[d.environment]}>{d.environment}</Badge></td>
                      <td className="px-2 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${
                          meta.tone === "success" ? "bg-emerald-500/15 text-emerald-300"
                          : meta.tone === "warning" ? "bg-amber-500/15 text-amber-300"
                          : "bg-red-500/15 text-red-300"
                        }`}>
                          <Icon className="h-3.5 w-3.5" />
                          {d.status}
                        </span>
                      </td>
                      <td className="px-2 py-3">
                        <a href={`https://${d.url}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-violet-300 hover:text-violet-200 text-sm">
                          <span className="truncate max-w-[200px]">{d.url}</span>
                          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        </a>
                      </td>
                      <td className="px-2 py-3 text-sm text-[#8b8fa3]">{d.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
