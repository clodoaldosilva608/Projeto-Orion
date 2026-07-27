import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2, Clock, Circle, Rocket, FileText, Layers, Users,
  Calendar, ExternalLink, Sparkles, ShieldCheck, Award, TrendingUp,
} from "lucide-react";
import { getWorkspaceDataAction } from "@/lib/license-actions";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  briefing: "Briefing",
  architecting: "Arquitetura",
  developing: "Desenvolvimento",
  testing: "Testes",
  deploying: "Deploy",
  delivered: "Entregue",
  maintenance: "Manutenção",
  cancelled: "Cancelado",
};

const STAGE_ICONS: Record<string, string> = {
  "Briefing": "📋",
  "Arquitetura": "🏗️",
  "Desenvolvimento": "💻",
  "Testes": "🧪",
  "Deploy": "🚀",
  "Entrega": "✅",
};

const LICENSE_STATUS_TONE: Record<string, { color: string; label: string }> = {
  active: { color: "#10b981", label: "Ativa" },
  suspended: { color: "#f59e0b", label: "Suspensa" },
  expired: { color: "#ef4444", label: "Expirada" },
  revoked: { color: "#ef4444", label: "Revogada" },
  pending_activation: { color: "#8b8fa3", label: "Pendente" },
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const { data, error } = await getWorkspaceDataAction(token);

  if (error || !data) {
    notFound();
  }

  const { project, client, license, stages, briefing } = data;
  const licenseTone = LICENSE_STATUS_TONE[license.status] ?? LICENSE_STATUS_TONE.pending_activation;
  const features = (project.keyFeatures as string[]) ?? [];
  const stack = (project.stack as string[]) ?? [];
  const isDelivered = project.status === "delivered" || project.status === "maintenance";

  return (
    <div className="min-h-screen bg-[#0a0b14] text-white">
      {/* Header */}
      <header className="border-b border-white/[0.06] bg-black/30 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl brand-gradient shadow-lg shadow-violet-500/30">
              <span className="text-xl font-bold text-white">O</span>
            </div>
            <div>
              <h1 className="text-lg font-bold brand-text">ORION</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#6b7280]">
                Workspace do Cliente
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold"
              style={{ backgroundColor: `${licenseTone.color}22`, color: licenseTone.color }}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Licença {licenseTone.label}
            </span>
            {isDelivered && project.productionUrl && (
              <a
                href={project.productionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-emerald-500/15 text-emerald-300 text-xs font-medium hover:bg-emerald-500/20"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Acessar sistema
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Project hero */}
        <div className="glass-card p-6 lg:p-8 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              {project.template && (
                <span className="text-2xl">{project.template.emoji}</span>
              )}
              <h2 className="text-2xl font-bold text-white">{project.name}</h2>
            </div>
            {project.description && (
              <p className="text-sm text-[#8b8fa3] mt-2 max-w-2xl">{project.description}</p>
            )}
            <div className="flex items-center gap-4 mt-4 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs text-[#8b8fa3]">
                <Calendar className="h-3.5 w-3.5" />
                Início: {formatDate(project.startDate)}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-[#8b8fa3]">
                <Clock className="h-3.5 w-3.5" />
                Previsão: {formatDate(project.estimatedEndDate)}
              </span>
              {project.deliveredAt && (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Entregue: {formatDate(project.deliveredAt)}
                </span>
              )}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-violet-300 hover:text-violet-200"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Ver demo
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-violet-300" />
              Progresso do projeto
            </h3>
            <span className="text-2xl font-bold text-violet-300">{project.progress}%</span>
          </div>
          <div className="h-3 rounded-full bg-white/[0.05] overflow-hidden">
            <div
              className="h-full rounded-full brand-gradient transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-[#8b8fa3] mt-2">
            <span>
              {stages.filter((s: any) => s.status === "completed").length} de {stages.length} etapas concluídas
            </span>
            <span className="capitalize">{STATUS_LABEL[project.status] ?? project.status}</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Layers className="h-4 w-4 text-violet-300" />
            Timeline do projeto
          </h3>
          <ol className="space-y-3">
            {stages.map((stage: any, idx: number) => {
              const icon = STAGE_ICONS[stage.name] ?? "📦";
              const isCompleted = stage.status === "completed";
              const isActive = stage.status === "active";
              const deliverables = (stage.deliverables as any[]) ?? [];
              return (
                <li key={stage.id} className="flex gap-3">
                  {/* Timeline dot + line */}
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm ${
                        isCompleted
                          ? "bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500/40"
                          : isActive
                          ? "bg-violet-500/20 text-violet-300 border-2 border-violet-500/40 pulse-dot"
                          : "bg-white/[0.03] text-[#6b7280] border-2 border-white/[0.06]"
                      }`}
                    >
                      {icon}
                    </div>
                    {idx < stages.length - 1 && (
                      <div
                        className={`w-0.5 h-12 mt-1 ${isCompleted ? "bg-emerald-500/30" : "bg-white/[0.06]"}`}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 pb-3 ${idx < stages.length - 1 ? "border-b border-white/[0.04]" : ""}`}>
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-medium ${isCompleted ? "text-emerald-300" : isActive ? "text-violet-300" : "text-[#8b8fa3]"}`}>
                        {stage.name}
                      </h4>
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          Concluído em {formatDate(stage.completedAt)}
                        </span>
                      )}
                      {isActive && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-violet-300">
                          <Clock className="h-3 w-3" />
                          Em andamento
                        </span>
                      )}
                      {stage.status === "pending" && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#6b7280]">
                          <Circle className="h-2.5 w-2.5" />
                          Pendente
                        </span>
                      )}
                    </div>
                    {stage.notes && (
                      <p className="text-xs text-[#8b8fa3] mt-1">{stage.notes}</p>
                    )}
                    {deliverables.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {deliverables.map((d: any, i: number) => (
                          <li key={i} className="flex items-center gap-2 text-xs">
                            {d.completedAt ? (
                              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Circle className="h-3 w-3 text-[#6b7280]" />
                            )}
                            <span className={d.completedAt ? "text-[#c4c8d8]" : "text-[#8b8fa3]"}>
                              {d.name}
                            </span>
                            {d.url && (
                              <a
                                href={d.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-violet-300 hover:text-violet-200"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Features + Stack */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-violet-300" />
                Funcionalidades
              </h3>
              <ul className="space-y-1.5">
                {features.map((f: string, i: number) => (
                  <li key={i} className="text-xs text-[#c4c8d8] flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {stack.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4 text-violet-300" />
                Tecnologia
              </h3>
              <div className="flex flex-wrap gap-2">
                {stack.map((s: string) => (
                  <span
                    key={s}
                    className="rounded-md bg-white/5 border border-white/[0.06] px-2 py-1 font-mono text-xs text-violet-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* License info */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-violet-300" />
            Informações da licença
          </h3>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <dt className="text-[#6b7280]">Status</dt>
              <dd className="font-semibold" style={{ color: licenseTone.color }}>
                {licenseTone.label}
              </dd>
            </div>
            <div>
              <dt className="text-[#6b7280]">Plano</dt>
              <dd className="text-white capitalize">{license.plan}</dd>
            </div>
            <div>
              <dt className="text-[#6b7280]">Ativada em</dt>
              <dd className="text-white">{formatDate(license.activatedAt)}</dd>
            </div>
            <div>
              <dt className="text-[#6b7280]">Expira em</dt>
              <dd className="text-white">{formatDate(license.expiresAt)}</dd>
            </div>
          </dl>
        </div>

        {/* Briefing */}
        {briefing && (
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-300" />
              Sobre o projeto
            </h3>
            <p className="text-xs text-[#8b8fa3]">{briefing.problemStatement}</p>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center py-4 text-xs text-[#6b7280]">
          <p>
            <Award className="h-3.5 w-3.5 inline mr-1" />
            Plataforma Orion — Gerenciamos todo o ciclo de vida do seu software
          </p>
          <p className="mt-1">
            Cliente: {client.name} · {client.email}
          </p>
        </footer>
      </main>
    </div>
  );
}
