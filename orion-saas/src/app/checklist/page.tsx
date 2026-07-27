import Link from "next/link";
import DashboardLayout from "../dashboard/layout";
import { PageHeader, PageButton, Badge } from "@/components/ui-parts";
import { CheckSquare, Plus, CheckCircle2, Circle, SkipForward, Clock, Award, History, Calendar } from "lucide-react";
import { getTodayChecklistAction, getChecklistHistoryAction } from "@/lib/checklist-actions";
import { TaskItem, StreakInfo } from "./ChecklistClient";

export const dynamic = "force-dynamic";

function todayLabel() {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

export default async function ChecklistPage() {
  const [{ data: todayData, error }, { data: history }] = await Promise.all([
    getTodayChecklistAction(),
    getChecklistHistoryAction(7),
  ]);

  const stats = todayData?.stats;
  const tasks = todayData?.tasks ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <PageHeader
          title="Checklist Diário"
          description={`Suas tarefas de hoje · ${todayLabel()}`}
          icon={CheckSquare}
          action={
            <Link href="/checklist/modelos">
              <PageButton variant="ghost">
                <Plus className="h-4 w-4" />
                Gerenciar modelos
              </PageButton>
            </Link>
          }
        />

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Progress hero */}
        {stats && (
          <div className="glass-card p-6">
            <div className="flex items-start gap-6 flex-wrap">
              <div className="flex-1 min-w-[280px]">
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="text-base font-semibold text-white">Progresso do dia</h3>
                  <span className="text-2xl font-bold text-violet-300">
                    {stats.progressPct}%
                  </span>
                </div>
                <div className="h-3 rounded-full bg-white/[0.05] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all brand-gradient"
                    style={{ width: `${stats.progressPct}%` }}
                  />
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-[#8b8fa3]">
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    {stats.done} concluídas
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Circle className="h-3.5 w-3.5 text-[#8b8fa3]" />
                    {stats.pending} pendentes
                  </span>
                  {stats.skipped > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <SkipForward className="h-3.5 w-3.5 text-amber-400" />
                      {stats.skipped} puladas
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 text-violet-300" />
                    {stats.totalPoints} / {stats.possiblePoints} pontos
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">
                  {stats.done}<span className="text-[#6b7280] text-xl">/{stats.total}</span>
                </div>
                <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">tarefas</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Tasks list (2 cols) */}
          <div className="lg:col-span-2 space-y-5">
            <div className="glass-card p-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-violet-300" />
                <h3 className="text-sm font-semibold text-white">Tarefas de hoje</h3>
                {tasks.length > 0 && tasks[0].template && (
                  <span className="text-xs text-[#6b7280] ml-auto">
                    Modelo: {tasks[0].template.name}
                  </span>
                )}
              </div>

              {tasks.length === 0 ? (
                <div className="px-5 py-12 flex flex-col items-center justify-center text-center">
                  <div className="h-14 w-14 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4">
                    <CheckSquare className="h-7 w-7 text-[#6b7280]" />
                  </div>
                  <h4 className="text-base font-semibold text-white mb-1">
                    Nenhuma tarefa para hoje
                  </h4>
                  <p className="text-sm text-[#8b8fa3] mb-4">
                    Crie um modelo de checklist com tarefas que se repetem em dias específicos.
                  </p>
                  <Link
                    href="/checklist/modelos"
                    className="inline-flex items-center gap-2 h-9 px-4 rounded-lg brand-gradient text-sm font-semibold text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Criar modelo
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-white/[0.04]">
                  {tasks.map((task: any) => (
                    <TaskItem
                      key={task.id}
                      id={task.id}
                      title={task.item?.title ?? "Tarefa"}
                      description={task.item?.description}
                      points={task.item?.points ?? 0}
                      status={task.status}
                      completedAt={task.completedAt}
                      isRequired={task.item?.isRequired ?? true}
                      estimatedMin={task.item?.estimatedMin}
                      notes={task.notes}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card p-4">
                <div className="text-xs text-[#8b8fa3] uppercase tracking-wide flex items-center gap-1">
                  <Award className="h-3 w-3" /> Pontos hoje
                </div>
                <div className="text-2xl font-bold text-violet-300 mt-1">
                  {stats?.totalPoints ?? 0}
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="text-xs text-[#8b8fa3] uppercase tracking-wide flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Concluídas
                </div>
                <div className="text-2xl font-bold text-emerald-300 mt-1">
                  {stats?.done ?? 0}
                </div>
              </div>
            </div>

            {/* History */}
            <div className="glass-card p-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
                <History className="h-4 w-4 text-violet-300" />
                <h3 className="text-sm font-semibold text-white">Histórico (7 dias)</h3>
              </div>
              {(!history || history.length === 0) ? (
                <div className="px-5 py-6 text-center text-xs text-[#8b8fa3]">
                  Sem histórico ainda.
                </div>
              ) : (
                <ul className="divide-y divide-white/[0.04]">
                  {history.map((h: any) => (
                    <li key={h.date} className="px-5 py-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-white font-medium">
                          {new Date(h.date + "T00:00:00").toLocaleDateString("pt-BR", {
                            weekday: "short", day: "2-digit", month: "short",
                          })}
                        </div>
                        <div className="text-[10px] text-[#6b7280]">
                          {h.done}/{h.total} concluídas · {h.points} pts
                        </div>
                      </div>
                      <div className="w-16 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                        <div
                          className="h-full brand-gradient"
                          style={{ width: `${h.progressPct}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-violet-300 w-8 text-right">
                        {h.progressPct}%
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Tip */}
            <div className="glass-card p-4">
              <div className="flex items-start gap-2 text-xs text-[#8b8fa3]">
                <Calendar className="h-4 w-4 text-violet-300 shrink-0 mt-0.5" />
                <p>
                  As tarefas são geradas automaticamente todos os dias com base nos
                  modelos ativos. Complete-as para ganhar pontos no sistema de
                  gamificação.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
