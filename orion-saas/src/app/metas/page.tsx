import Link from "next/link";
import {
  Target,
  Plus,
  Calendar,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import DashboardLayout from "../dashboard/layout";
import { PageHeader, PageButton, Badge } from "@/components/ui-parts";
import { DeleteGoalButton } from "./DeleteGoalButton";
import { listGoalsAction } from "@/lib/actions";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  daily: "Diária",
  weekly: "Semanal",
  monthly: "Mensal",
  quarterly: "Trimestral",
  yearly: "Anual",
  custom: "Personalizada",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    month: "short",
    day: "numeric",
  });
}

export default async function MetasPage() {
  const { data: goals, error } = await listGoalsAction();

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Metas e Campanhas"
          description="Acompanhe o progresso dos objetivos da equipe"
          icon={Target}
          action={
            <Link href="/metas/nova">
              <PageButton>
                <Plus className="h-4 w-4" />
                Nova Meta
              </PageButton>
            </Link>
          }
        />

        {/* Quick navigation */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/indicadores"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 h-9 text-xs font-medium text-[#8b8fa3] hover:text-white hover:bg-white/10 transition-colors"
          >
            Indicadores
          </Link>
          <Link
            href="/resultados"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 h-9 text-xs font-medium text-[#8b8fa3] hover:text-white hover:bg-white/10 transition-colors"
          >
            Resultados
          </Link>
          <Link
            href="/aprovacoes"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 h-9 text-xs font-medium text-[#8b8fa3] hover:text-white hover:bg-white/10 transition-colors"
          >
            Aprovações
          </Link>
          <Link
            href="/ranking"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 h-9 text-xs font-medium text-[#8b8fa3] hover:text-white hover:bg-white/10 transition-colors"
          >
            Ranking
          </Link>
        </div>

        {error && (
          <div className="glass-card p-4 flex items-center gap-3 border-red-500/30">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {(!goals || goals.length === 0) && !error && (
          <div className="glass-card p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-white/5">
              <Target className="h-8 w-8 text-[#6b7280]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Nenhuma meta encontrada
            </h3>
            <p className="text-sm text-[#8b8fa3] max-w-md mx-auto mb-6">
              Você ainda não possui metas cadastradas. Crie sua primeira meta
              para engajar sua equipe.
            </p>
            <Link href="/metas/nova">
              <PageButton>Criar Meta</PageButton>
            </Link>
          </div>
        )}

        {goals && goals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 stagger">
            {goals.map((goal) => {
              const totalAchieved = goal.results.reduce(
                (acc: number, r: { value: number }) => acc + r.value,
                0,
              );
              const targetValue = Number(goal.targetValue);
              const percentage =
                targetValue > 0
                  ? Math.min(100, Math.round((totalAchieved / targetValue) * 100))
                  : 0;
              const indicatorName = goal.indicator?.name ?? "—";
              const indicatorUnit = goal.indicator?.unit ?? "";
              const typeLabel = TYPE_LABELS[goal.type] ?? goal.type;

              return (
                <div
                  key={goal.id}
                  className="glass-card glass-card-hover p-5 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shrink-0 brand-gradient">
                        <Target className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3
                          className="font-semibold text-white truncate max-w-[180px]"
                          title={goal.name}
                        >
                          {goal.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge tone="violet">{typeLabel}</Badge>
                          <span className="text-[10px] text-[#6b7280] truncate">
                            {indicatorName}
                          </span>
                        </div>
                      </div>
                    </div>
                    <DeleteGoalButton goalId={goal.id} />
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-white/[0.03]">
                      <div>
                        <p className="text-xs text-[#6b7280]">
                          Alvo{indicatorUnit ? ` (${indicatorUnit})` : ""}
                        </p>
                        <p className="font-bold text-white mt-0.5">
                          {targetValue.toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6b7280]">Realizado</p>
                        <p className="font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                          {totalAchieved.toLocaleString("pt-BR")}
                          {percentage >= 100 && (
                            <TrendingUp className="h-3 w-3" />
                          )}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5 text-xs">
                        <span className="text-[#8b8fa3]">Progresso</span>
                        <span
                          className={`font-medium ${
                            percentage >= 100
                              ? "text-emerald-400"
                              : "text-violet-300"
                          }`}
                        >
                          {percentage}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            percentage >= 100
                              ? "bg-gradient-to-r from-emerald-500 to-cyan-500"
                              : "brand-gradient"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    <div
                      className="flex items-center justify-between pt-3 mt-2 text-xs text-[#6b7280]"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {formatDate(goal.startDate)} até{" "}
                          {formatDate(goal.endDate)}
                        </span>
                      </div>
                      <span className="text-[#8b8fa3]">
                        {goal.results.length} resultado
                        {goal.results.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
