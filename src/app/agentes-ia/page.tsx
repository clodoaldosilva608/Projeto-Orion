import DashboardLayout from "../dashboard/layout";
import { Bot, Plus, Cpu, MessageSquare, Code } from "lucide-react";
import { PageHeader, PageButton, Badge } from "@/components/ui-parts";

export const dynamic = "force-dynamic";

const AGENTS = [
  { name: "Orion CodeGen", model: "GPT-4o", status: "Ativo", activity: "há 2 min", tasks: "1.248", icon: Code, color: "text-violet-300 bg-violet-500/15" },
  { name: "Orion Designer", model: "Claude 3.5 Sonnet", status: "Ativo", activity: "há 8 min", tasks: "842", icon: Cpu, color: "text-fuchsia-300 bg-fuchsia-500/15" },
  { name: "Orion QA", model: "GPT-4o-mini", status: "Ativo", activity: "há 15 min", tasks: "2.104", icon: Bot, color: "text-emerald-300 bg-emerald-500/15" },
  { name: "Orion Deploy", model: "Claude 3 Haiku", status: "Inativo", activity: "há 2 h", tasks: "318", icon: Cpu, color: "text-sky-300 bg-sky-500/15" },
  { name: "Orion Support", model: "GPT-4o", status: "Ativo", activity: "há 1 min", tasks: "5.672", icon: MessageSquare, color: "text-amber-300 bg-amber-500/15" },
  { name: "Orion Analyst", model: "GPT-4o-mini", status: "Ativo", activity: "há 22 min", tasks: "948", icon: Cpu, color: "text-indigo-300 bg-indigo-500/15" },
];

const STATUS_TONE: Record<string, "success" | "neutral"> = {
  Ativo: "success",
  Inativo: "neutral",
};

export default function AgentesIaPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Agentes de IA"
          description="Agentes inteligentes que automatizam tarefas na plataforma."
          icon={Bot}
          action={<PageButton><Plus className="h-4 w-4" />Novo Agente</PageButton>}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { l: "Agentes Ativos", v: "5", c: "de 6 configurados" },
            { l: "Tarefas no Mês", v: "11.132", c: "+22,4% vs mês anterior" },
            { l: "Taxa de Sucesso", v: "97,8%", c: "+0,6pp vs mês anterior" },
            { l: "Tokens Consumidos", v: "271,7k", c: "no mês atual" },
          ].map((s) => (
            <div key={s.l} className="glass-card glass-card-hover p-5">
              <p className="text-sm text-[#8b8fa3]">{s.l}</p>
              <p className="text-2xl font-bold text-white mt-1">{s.v}</p>
              <p className="text-xs text-emerald-400 mt-1.5">{s.c}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {AGENTS.map((a) => {
            const Icon = a.icon;
            return (
              <div key={a.name} className="glass-card glass-card-hover p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${a.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge tone={STATUS_TONE[a.status]}>
                    <span className={`inline-flex items-center gap-1.5`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${a.status === "Ativo" ? "bg-emerald-400 pulse-dot" : "bg-white/40"}`} />
                      {a.status}
                    </span>
                  </Badge>
                </div>
                <p className="text-base font-semibold text-white">{a.name}</p>
                <p className="text-xs text-[#8b8fa3] mt-0.5">Modelo: {a.model}</p>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <p className="text-[#6b7280]">Tarefas</p>
                    <p className="text-sm font-bold text-white">{a.tasks}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#6b7280]">Última atividade</p>
                    <p className="text-sm text-[#8b8fa3]">{a.activity}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
