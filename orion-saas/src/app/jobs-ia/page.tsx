import DashboardLayout from "../dashboard/layout";
import { Cpu, Plus, Clock, Repeat, Calendar } from "lucide-react";
import { PageHeader, PageButton, Badge } from "@/components/ui-parts";

export const dynamic = "force-dynamic";

const JOBS = [
  { name: "Geração de build automática", agent: "Orion CodeGen", status: "Em andamento", progress: 64, schedule: "A cada commit" },
  { name: "Análise de código estática", agent: "Orion QA", status: "Em andamento", progress: 28, schedule: "Diário 02:00" },
  { name: "Treinamento de embeddings", agent: "Orion Analyst", status: "Agendado", progress: 0, schedule: "Semanal dom 03:00" },
  { name: "Backup de base de conhecimento", agent: "Orion Support", status: "Concluído", progress: 100, schedule: "Diário 23:00" },
  { name: "Sincronização de licenças", agent: "Orion Deploy", status: "Concluído", progress: 100, schedule: "A cada 6h" },
  { name: "Geração de relatórios", agent: "Orion Analyst", status: "Em andamento", progress: 82, schedule: "Diário 06:00" },
  { name: "Limpeza de cache CDN", agent: "Orion Deploy", status: "Agendado", progress: 0, schedule: "Semanal sáb 04:00" },
  { name: "Detecção de anomalias", agent: "Orion QA", status: "Em andamento", progress: 45, schedule: "Tempo real" },
];

const STATUS_TONE: Record<string, "success" | "warning" | "info"> = {
  Concluído: "success",
  "Em andamento": "warning",
  Agendado: "info",
};

const SCHEDULE_ICON: Record<string, typeof Clock> = {
  "A cada commit": Repeat,
  "Tempo real": Clock,
};

export default function JobsIaPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Jobs de IA"
          description="Tarefas agendadas e em execução pelos agentes de IA."
          icon={Cpu}
          action={<PageButton><Plus className="h-4 w-4" />Novo Job</PageButton>}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { l: "Jobs no Mês", v: "4.820", c: "+18,2% vs mês anterior" },
            { l: "Em Execução", v: "4", c: "Atualizando em tempo real" },
            { l: "Agendados", v: "18", c: "Próximas 24h" },
            { l: "Taxa de Sucesso", v: "98,4%", c: "+0,4pp vs mês anterior" },
          ].map((s) => (
            <div key={s.l} className="glass-card glass-card-hover p-5">
              <p className="text-sm text-[#8b8fa3]">{s.l}</p>
              <p className="text-2xl font-bold text-white mt-1">{s.v}</p>
              <p className="text-xs text-emerald-400 mt-1.5">{s.c}</p>
            </div>
          ))}
        </div>

        <div className="glass-card p-5 lg:p-6">
          <h3 className="text-base font-semibold text-white mb-4">Lista de Jobs</h3>
          <div className="space-y-3">
            {JOBS.map((j, i) => {
              const SIcon = SCHEDULE_ICON[j.schedule] ?? Calendar;
              return (
                <div key={i} className="rounded-lg bg-white/[0.03] border border-white/[0.04] p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{j.name}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-[#6b7280]">
                        <span>Agente: <span className="text-[#8b8fa3]">{j.agent}</span></span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1"><SIcon className="h-3 w-3" /> {j.schedule}</span>
                      </div>
                    </div>
                    <Badge tone={STATUS_TONE[j.status]}>{j.status}</Badge>
                  </div>
                  {j.status === "Em andamento" && (
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full brand-gradient transition-all" style={{ width: `${j.progress}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-[#8b8fa3] w-9 text-right">{j.progress}%</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
