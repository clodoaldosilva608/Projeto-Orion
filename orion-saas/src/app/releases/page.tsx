import DashboardLayout from "../dashboard/layout";
import { Tags, Plus, GitCommit } from "lucide-react";
import { PageHeader, PageButton, Badge } from "@/components/ui-parts";

export const dynamic = "force-dynamic";

const RELEASES = [
  { version: "v3.1.0", project: "MarketPro", type: "Major", status: "Publicada", date: "25/07/2025, 18:40" },
  { version: "v2.4.0", project: "FIManager", type: "Major", status: "RC", date: "26/07/2025, 09:42" },
  { version: "v2.0.1", project: "BioSaúde", type: "Patch", status: "Publicada", date: "26/07/2025, 11:05" },
  { version: "v1.4.2", project: "PagueMenos", type: "Patch", status: "Publicada", date: "26/07/2025, 14:22" },
  { version: "v1.2.0", project: "HealthPlus", type: "Minor", status: "Publicada", date: "23/07/2025, 14:33" },
  { version: "v2.0.0", project: "AgroTech", type: "Major", status: "Publicada", date: "22/07/2025, 09:18" },
  { version: "v1.0.0", project: "EduSmart", type: "Major", status: "Publicada", date: "24/07/2025, 10:00" },
  { version: "v0.9.2", project: "LogTrack", type: "Minor", status: "Pendente", date: "25/07/2025, 16:30" },
];

const TYPE_TONE: Record<string, "violet" | "info" | "neutral"> = {
  Major: "violet",
  Minor: "info",
  Patch: "neutral",
};

const STATUS_TONE: Record<string, "success" | "warning" | "danger"> = {
  Publicada: "success",
  RC: "warning",
  Pendente: "danger",
};

export default function ReleasesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Releases"
          description="Versões publicadas de cada aplicação."
          icon={Tags}
          action={<PageButton><Plus className="h-4 w-4" />Nova Release</PageButton>}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { l: "Releases no Mês", v: "84", c: "+6,5% vs mês anterior" },
            { l: "Major Releases", v: "12", c: "14,3% do total" },
            { l: "Em Homologação", v: "8", c: "Aguardando publicação" },
            { l: "Publicadas", v: "64", c: "76,2% do total" },
          ].map((s) => (
            <div key={s.l} className="glass-card glass-card-hover p-5">
              <p className="text-sm text-[#8b8fa3]">{s.l}</p>
              <p className="text-2xl font-bold text-white mt-1">{s.v}</p>
              <p className="text-xs text-emerald-400 mt-1.5">{s.c}</p>
            </div>
          ))}
        </div>

        <div className="glass-card p-5 lg:p-6">
          <h3 className="text-base font-semibold text-white mb-4">Lista de Releases</h3>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#6b7280] border-b border-white/5">
                  <th className="font-medium px-2 pb-3">Versão</th>
                  <th className="font-medium px-2 pb-3">Projeto</th>
                  <th className="font-medium px-2 pb-3">Tipo</th>
                  <th className="font-medium px-2 pb-3">Status</th>
                  <th className="font-medium px-2 pb-3">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {RELEASES.map((r, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <GitCommit className="h-4 w-4 text-[#6b7280]" />
                        <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs font-mono text-white/80">{r.version}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-sm font-semibold text-white">{r.project}</td>
                    <td className="px-2 py-3"><Badge tone={TYPE_TONE[r.type]}>{r.type}</Badge></td>
                    <td className="px-2 py-3"><Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge></td>
                    <td className="px-2 py-3 text-sm text-[#8b8fa3]">{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
