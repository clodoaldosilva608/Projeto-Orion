import DashboardLayout from "../dashboard/layout";
import { ListTree, Plus, MoreHorizontal } from "lucide-react";
import { PageHeader, PageButton, Badge } from "@/components/ui-parts";

export const dynamic = "force-dynamic";

const COLUMNS = [
  {
    title: "Planejamento",
    color: "#8b5cf6",
    cards: [
      { name: "LogTrack v1.0", client: "LogTrack Logística", priority: "Alta", tags: ["Mobile", "Logística"] },
      { name: "FitGym App", client: "FitGym Studios", priority: "Média", tags: ["Mobile"] },
      { name: "VarejoMax Web", client: "VarejoMax", priority: "Baixa", tags: ["Web"] },
    ],
  },
  {
    title: "Desenvolvimento",
    color: "#6366f1",
    cards: [
      { name: "FormaPlus", client: "FormaPlus Ltda.", priority: "Alta", tags: ["Web", "PWA"] },
      { name: "EduSmart", client: "EduSmart Cursos", priority: "Média", tags: ["Web"] },
      { name: "HealthPlus", client: "HealthPlus", priority: "Alta", tags: ["Mobile"] },
    ],
  },
  {
    title: "Testes",
    color: "#ec4899",
    cards: [
      { name: "BioSaúde", client: "BioSaúde Clínicas", priority: "Alta", tags: ["Mobile", "API"] },
      { name: "AgroTech", client: "AgroTech Soluções", priority: "Média", tags: ["Web"] },
    ],
  },
  {
    title: "Homologação",
    color: "#f59e0b",
    cards: [
      { name: "FIManager", client: "FIManager Finance", priority: "Crítica", tags: ["Web", "Finance"] },
    ],
  },
  {
    title: "Concluído",
    color: "#10b981",
    cards: [
      { name: "MarketPro", client: "MarketPro Agência", priority: "Média", tags: ["PWA"] },
      { name: "PagueMenos", client: "VarejoMax", priority: "Alta", tags: ["Web", "E-commerce"] },
      { name: "EduSmart v1", client: "EduSmart Cursos", priority: "Média", tags: ["Web"] },
    ],
  },
];

const PRIORITY_TONE: Record<string, "danger" | "warning" | "info" | "neutral"> = {
  Crítica: "danger",
  Alta: "warning",
  Média: "info",
  Baixa: "neutral",
};

export default function FileProjetosPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="File de Projetos"
          description="Quadro Kanban do fluxo de desenvolvimento."
          icon={ListTree}
          action={<PageButton><Plus className="h-4 w-4" />Nova Tarefa</PageButton>}
        />

        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
          {COLUMNS.map((col) => (
            <div key={col.title} className="w-[300px] shrink-0">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                  <h3 className="text-sm font-semibold text-white">{col.title}</h3>
                  <span className="text-xs text-[#6b7280]">{col.cards.length}</span>
                </div>
                <button className="text-[#6b7280] hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                {col.cards.map((card) => (
                  <div key={card.name} className="glass-card glass-card-hover p-4 cursor-pointer">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-semibold text-white">{card.name}</p>
                      <Badge tone={PRIORITY_TONE[card.priority]}>{card.priority}</Badge>
                    </div>
                    <p className="text-xs text-[#8b8fa3] mb-3">{card.client}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {card.tags.map((t) => (
                        <span key={t} className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-[#8b8fa3]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                <button className="w-full rounded-lg border border-dashed border-white/10 py-2.5 text-xs text-[#6b7280] hover:text-white hover:border-white/20 transition-colors">
                  + Adicionar tarefa
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
