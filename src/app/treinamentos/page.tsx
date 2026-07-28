import DashboardLayout from "../dashboard/layout";
import { PageHeader, Badge } from "@/components/ui-parts";
import { GraduationCap, PlayCircle, FileText, Clock, CheckCircle2, Plus } from "lucide-react";
import { listTrainingsAction } from "@/lib/training-actions";
import { NewTrainingForm, ProgressButton, DeleteTrainingButton } from "./TreinamentosClient";

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, string> = {
  onboarding: "Onboarding", sales: "Vendas", product: "Produto",
  compliance: "Compliance", technical: "Técnico", soft_skills: "Soft Skills", other: "Outros",
};

const FORMAT_ICON: Record<string, any> = {
  video: PlayCircle, pdf: FileText, presentation: FileText, interactive: PlayCircle, external_link: PlayCircle,
};

export default async function TreinamentosPage() {
  const { data: trainings, error } = await listTrainingsAction();
  const list = trainings ?? [];
  const completed = list.filter((t: any) => t.progress?.status === "completed").length;
  const inProgress = list.filter((t: any) => t.progress?.status === "in_progress").length;
  const required = list.filter((t: any) => t.isRequired).length;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <PageHeader title="Biblioteca de Treinamentos" description="Cursos, vídeos e materiais para capacitação da equipe." icon={GraduationCap} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4"><div className="text-xs text-[#8b8fa3] uppercase">Total</div><div className="text-2xl font-bold text-white mt-1">{list.length}</div></div>
          <div className="glass-card p-4"><div className="text-xs text-[#8b8fa3] uppercase">Concluídos</div><div className="text-2xl font-bold text-emerald-300 mt-1">{completed}</div></div>
          <div className="glass-card p-4"><div className="text-xs text-[#8b8fa3] uppercase">Em andamento</div><div className="text-2xl font-bold text-violet-300 mt-1">{inProgress}</div></div>
          <div className="glass-card p-4"><div className="text-xs text-[#8b8fa3] uppercase">Obrigatórios</div><div className="text-2xl font-bold text-amber-300 mt-1">{required}</div></div>
        </div>
        <NewTrainingForm />
        {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
        {list.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <GraduationCap className="h-12 w-12 text-[#6b7280] mx-auto mb-3" />
            <p className="text-sm text-[#8b8fa3]">Nenhum treinamento ainda. Crie o primeiro acima.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((t: any) => {
              const Icon = FORMAT_ICON[t.format] ?? FileText;
              const isCompleted = t.progress?.status === "completed";
              return (
                <div key={t.id} className="glass-card p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300"><Icon className="h-5 w-5" /></div>
                      <div><h3 className="text-sm font-semibold text-white">{t.title}</h3><p className="text-[10px] text-[#6b7280]">{CATEGORY_LABEL[t.category] ?? t.category}</p></div>
                    </div>
                    {t.isRequired && <Badge tone="warning">Obrigatório</Badge>}
                  </div>
                  {t.description && <p className="text-xs text-[#8b8fa3] line-clamp-2">{t.description}</p>}
                  <div className="flex items-center gap-3 text-[10px] text-[#6b7280]">
                    {t.durationMin && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{t.durationMin}min</span>}
                    <span className="capitalize">{t.format}</span>
                  </div>
                  {t.progress && (
                    <div>
                      <div className="flex justify-between text-[10px] text-[#8b8fa3] mb-1"><span>{t.progress.status === "completed" ? "Concluído" : "Progresso"}</span><span>{t.progress.progressPct}%</span></div>
                      <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden"><div className={`h-full ${isCompleted ? "bg-emerald-500" : "brand-gradient"}`} style={{ width: `${t.progress.progressPct}%` }} /></div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-auto pt-2 border-t border-white/[0.06]">
                    {t.contentUrl && <a href={t.contentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-violet-500/15 text-violet-300 text-xs font-medium hover:bg-violet-500/20 flex-1 justify-center"><PlayCircle className="h-3.5 w-3.5" />Acessar</a>}
                    <ProgressButton id={t.id} currentProgress={t.progress?.progressPct ?? 0} />
                    <DeleteTrainingButton id={t.id} title={t.title} />
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
