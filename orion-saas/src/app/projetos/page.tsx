import DashboardLayout from "../dashboard/layout";
import { FolderKanban, Plus, Filter } from "lucide-react";
import { PageHeader, PageButton, Badge } from "@/components/ui-parts";

export const dynamic = "force-dynamic";

const PROJECTS = [
  { name: "FormaPlus", client: "FormaPlus Ltda.", status: "Em Desenvolvimento", progress: 64, updated: "há 2 h", tone: "violet" as const },
  { name: "BioSaude", client: "BioSaúde Clínicas", status: "Em Testes", progress: 82, updated: "há 38 min", tone: "info" as const },
  { name: "FIManager", client: "FIManager Finance", status: "Homologação", progress: 91, updated: "há 1 h", tone: "warning" as const },
  { name: "MarketPro", client: "MarketPro Agência", status: "Concluído", progress: 100, updated: "há 5 h", tone: "success" as const },
  { name: "LogTrack", client: "LogTrack Logística", status: "Planejamento", progress: 18, updated: "há 1 d", tone: "neutral" as const },
  { name: "EduSmart", client: "EduSmart Cursos", status: "Em Desenvolvimento", progress: 47, updated: "há 3 h", tone: "violet" as const },
  { name: "HealthPlus", client: "HealthPlus", status: "Em Testes", progress: 73, updated: "há 6 h", tone: "info" as const },
  { name: "AgroTech", client: "AgroTech Soluções", status: "Concluído", progress: 100, updated: "há 2 d", tone: "success" as const },
];

const BAR_TONE: Record<string, string> = {
  violet: "bg-violet-500",
  info: "bg-sky-500",
  warning: "bg-amber-500",
  success: "bg-emerald-500",
  neutral: "bg-white/30",
};

export default function ProjetosPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Projetos"
          description="Acompanhe o andamento de todos os projetos da plataforma."
          icon={FolderKanban}
          action={
            <div className="flex gap-2">
              <PageButton variant="ghost">
                <Filter className="h-4 w-4" />
                Filtrar
              </PageButton>
              <PageButton>
                <Plus className="h-4 w-4" />
                Novo Projeto
              </PageButton>
            </div>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { l: "Projetos Ativos", v: "342", c: "+8,7% este mês" },
            { l: "Em Desenvolvimento", v: "56", c: "16,4% do total" },
            { l: "Em Testes", v: "68", c: "19,9% do total" },
            { l: "Concluídos", v: "95", c: "27,8% do total" },
          ].map((s) => (
            <div key={s.l} className="glass-card glass-card-hover p-5">
              <p className="text-sm text-[#8b8fa3]">{s.l}</p>
              <p className="text-2xl font-bold text-white mt-1">{s.v}</p>
              <p className="text-xs text-emerald-400 mt-1.5">{s.c}</p>
            </div>
          ))}
        </div>

        <div className="glass-card p-5 lg:p-6">
          <h3 className="text-base font-semibold text-white mb-4">Todos os Projetos</h3>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#6b7280] border-b border-white/5">
                  <th className="font-medium px-2 pb-3">Projeto</th>
                  <th className="font-medium px-2 pb-3">Cliente</th>
                  <th className="font-medium px-2 pb-3">Status</th>
                  <th className="font-medium px-2 pb-3 w-48">Progresso</th>
                  <th className="font-medium px-2 pb-3">Atualizado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {PROJECTS.map((p) => (
                  <tr key={p.name} className="hover:bg-white/[0.02]">
                    <td className="px-2 py-3 text-sm font-semibold text-white">{p.name}</td>
                    <td className="px-2 py-3 text-sm text-[#8b8fa3]">{p.client}</td>
                    <td className="px-2 py-3"><Badge tone={p.tone}>{p.status}</Badge></td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                          <div className={`h-full rounded-full ${BAR_TONE[p.tone]}`} style={{ width: `${p.progress}%` }} />
                        </div>
                        <span className="text-[11px] font-semibold text-[#8b8fa3] w-8 text-right">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-sm text-[#8b8fa3]">{p.updated}</td>
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
