import DashboardLayout from "../dashboard/layout";
import { Bug, Plus, AlertOctagon, AlertTriangle, Info } from "lucide-react";
import { PageHeader, PageButton, Badge } from "@/components/ui-parts";

export const dynamic = "force-dynamic";

const ANOMALIES = [
  { title: "Latência elevada no endpoint /api/checkout", severity: "Crítica", project: "PagueMenos", status: "Aberta", detected: "há 12 min" },
  { title: "Memory leak no worker de IA", severity: "Alta", project: "BioSaúde", status: "Em análise", detected: "há 1 h" },
  { title: "Falha intermitente no webhook de pagamento", severity: "Alta", project: "FIManager", status: "Em andamento", detected: "há 2 h" },
  { title: "Cache miss excessivo no Redis", severity: "Média", project: "MarketPro", status: "Aberta", detected: "há 4 h" },
  { title: "Erro 404 em assets estáticos", severity: "Baixa", project: "LogTrack", status: "Resolvida", detected: "há 6 h" },
  { title: "Timeout em query de relatórios", severity: "Média", project: "EduSmart", status: "Em análise", detected: "há 8 h" },
  { title: "Divergência em contagem de licenças", severity: "Baixa", project: "HealthPlus", status: "Resolvida", detected: "há 1 d" },
  { title: "Webhook de deploy não disparando", severity: "Média", project: "AgroTech", status: "Em andamento", detected: "há 1 d" },
];

const SEVERITY_META: Record<string, { tone: "danger" | "warning" | "info"; icon: typeof AlertOctagon }> = {
  Crítica: { tone: "danger", icon: AlertOctagon },
  Alta: { tone: "warning", icon: AlertTriangle },
  Média: { tone: "warning", icon: AlertTriangle },
  Baixa: { tone: "info", icon: Info },
};

const STATUS_TONE: Record<string, "danger" | "warning" | "success" | "info"> = {
  Aberta: "danger",
  "Em análise": "info",
  "Em andamento": "warning",
  Resolvida: "success",
};

export default function AnomaliasPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Anomalias"
          description="Monitoramento de anomalias detectadas nas aplicações."
          icon={Bug}
          action={<PageButton><Plus className="h-4 w-4" />Reportar Anomalia</PageButton>}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { l: "Anomalias Ativas", v: "3", c: "1 crítica, 2 altas" },
            { l: "Resolvidas no Mês", v: "184", c: "+12,4% vs mês anterior" },
            { l: "Tempo Médio de Resolução", v: "2h 14m", c: "-18m vs mês anterior" },
            { l: "MTTR Críticas", v: "38m", c: "Abaixo do SLA (60m)" },
          ].map((s) => (
            <div key={s.l} className="glass-card glass-card-hover p-5">
              <p className="text-sm text-[#8b8fa3]">{s.l}</p>
              <p className="text-2xl font-bold text-white mt-1">{s.v}</p>
              <p className="text-xs text-emerald-400 mt-1.5">{s.c}</p>
            </div>
          ))}
        </div>

        <div className="glass-card p-5 lg:p-6">
          <h3 className="text-base font-semibold text-white mb-4">Lista de Anomalias</h3>
          <div className="space-y-3">
            {ANOMALIES.map((a, i) => {
              const meta = SEVERITY_META[a.severity];
              const Icon = meta.icon;
              return (
                <div key={i} className={`flex items-start gap-3 rounded-lg bg-white/[0.03] border border-white/[0.04] border-l-2 p-4 ${
                  meta.tone === "danger" ? "border-l-red-500"
                  : meta.tone === "warning" ? "border-l-amber-500"
                  : "border-l-sky-500"
                }`}>
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    meta.tone === "danger" ? "bg-red-500/15 text-red-300"
                    : meta.tone === "warning" ? "bg-amber-500/15 text-amber-300"
                    : "bg-sky-500/15 text-sky-300"
                  }`}>
                    <Icon className="h-[18px] w-[18px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white">{a.title}</p>
                      <Badge tone={meta.tone}>{a.severity}</Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-[#6b7280]">
                      <span>Projeto: <span className="text-[#8b8fa3]">{a.project}</span></span>
                      <span>·</span>
                      <span>Detectada {a.detected}</span>
                    </div>
                  </div>
                  <Badge tone={STATUS_TONE[a.status]}>{a.status}</Badge>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
