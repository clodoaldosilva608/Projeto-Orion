import DashboardLayout from "../dashboard/layout";
import { Hammer, Plus, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { PageHeader, PageButton, Badge } from "@/components/ui-parts";

export const dynamic = "force-dynamic";

const BUILDS = [
  { project: "PagueMenos", version: "v1.4.2", status: "Sucesso", duration: "1m 48s", date: "26/07/2025, 14:20" },
  { project: "BioSaúde", version: "v2.0.1", status: "Sucesso", duration: "2m 12s", date: "26/07/2025, 11:03" },
  { project: "FIManager", version: "v2.4.0-rc.1", status: "Em andamento", duration: "—", date: "26/07/2025, 09:42" },
  { project: "MarketPro", version: "v3.1.0", status: "Sucesso", duration: "1m 30s", date: "25/07/2025, 18:38" },
  { project: "LogTrack", version: "v0.9.2", status: "Falhou", duration: "0m 22s", date: "25/07/2025, 16:15" },
  { project: "EduSmart", version: "v1.0.0", status: "Sucesso", duration: "2m 05s", date: "24/07/2025, 10:10" },
  { project: "HealthPlus", version: "v1.2.0", status: "Sucesso", duration: "1m 55s", date: "23/07/2025, 14:33" },
  { project: "AgroTech", version: "v2.0.0", status: "Sucesso", duration: "2m 28s", date: "22/07/2025, 09:18" },
];

const STATUS_META: Record<string, { tone: "success" | "warning" | "danger"; icon: typeof CheckCircle2 }> = {
  Sucesso: { tone: "success", icon: CheckCircle2 },
  "Em andamento": { tone: "warning", icon: Loader2 },
  Falhou: { tone: "danger", icon: XCircle },
};

export default function BuildsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Builds"
          description="Histórico de builds dos projetos."
          icon={Hammer}
          action={<PageButton><Plus className="h-4 w-4" />Disparar Build</PageButton>}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { l: "Builds no Mês", v: "1.248", c: "+8,1% vs mês anterior" },
            { l: "Taxa de Sucesso", v: "94,2%", c: "+1,2pp vs mês anterior" },
            { l: "Duração Média", v: "1m 52s", c: "-12s vs mês anterior" },
            { l: "Em Andamento", v: "3", c: "Atualizando em tempo real" },
          ].map((s) => (
            <div key={s.l} className="glass-card glass-card-hover p-5">
              <p className="text-sm text-[#8b8fa3]">{s.l}</p>
              <p className="text-2xl font-bold text-white mt-1">{s.v}</p>
              <p className="text-xs text-emerald-400 mt-1.5">{s.c}</p>
            </div>
          ))}
        </div>

        <div className="glass-card p-5 lg:p-6">
          <h3 className="text-base font-semibold text-white mb-4">Histórico de Builds</h3>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#6b7280] border-b border-white/5">
                  <th className="font-medium px-2 pb-3">Projeto</th>
                  <th className="font-medium px-2 pb-3">Versão</th>
                  <th className="font-medium px-2 pb-3">Status</th>
                  <th className="font-medium px-2 pb-3">Duração</th>
                  <th className="font-medium px-2 pb-3">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {BUILDS.map((b, i) => {
                  const meta = STATUS_META[b.status];
                  const Icon = meta.icon;
                  return (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      <td className="px-2 py-3 text-sm font-semibold text-white">{b.project}</td>
                      <td className="px-2 py-3">
                        <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs font-mono text-white/80">{b.version}</span>
                      </td>
                      <td className="px-2 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${
                          meta.tone === "success" ? "bg-emerald-500/15 text-emerald-300"
                          : meta.tone === "warning" ? "bg-amber-500/15 text-amber-300"
                          : "bg-red-500/15 text-red-300"
                        }`}>
                          <Icon className={`h-3.5 w-3.5 ${b.status === "Em andamento" ? "animate-spin" : ""}`} />
                          {b.status}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-sm text-[#8b8fa3]">{b.duration}</td>
                      <td className="px-2 py-3 text-sm text-[#8b8fa3]">{b.date}</td>
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
