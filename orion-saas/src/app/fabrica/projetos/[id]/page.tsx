import Link from "next/link";
import { notFound } from "next/navigation";
import DashboardLayout from "../../../dashboard/layout";
import { PageHeader, Badge } from "@/components/ui-parts";
import {
  ArrowLeft, FolderKanban, User, Mail, Calendar, DollarSign, Clock,
  Layers, Target, ListChecks, TrendingUp, Github, ExternalLink,
} from "lucide-react";
import { getProjectAction, listCompanyUsersForTeamAction } from "@/lib/fabrica-actions";
import { KanbanBoard, ProjectInfo } from "./ProjectDetailClient";

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

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "info" | "violet"> = {
  briefing: "violet",
  architecting: "info",
  developing: "warning",
  testing: "info",
  deploying: "warning",
  delivered: "success",
  maintenance: "neutral",
  cancelled: "danger",
};

function formatBRL(cents: number | null): string {
  if (!cents) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(cents / 100);
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ data: project, error }, { data: companyUsers }] = await Promise.all([
    getProjectAction(id),
    listCompanyUsersForTeamAction(),
  ]);

  if (error || !project) {
    notFound();
  }

  const p: any = project;
  const features = (p.keyFeatures as string[]) ?? [];
  const stack = (p.stack as string[]) ?? [];
  const teamMembers = p.teamMembers ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <Link
          href="/fabrica/projetos"
          className="inline-flex items-center gap-1.5 text-xs text-[#8b8fa3] hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para projetos
        </Link>

        <PageHeader
          title={p.name}
          description={p.description ?? "Sem descrição"}
          icon={FolderKanban}
        />

        {/* Top info bar */}
        <div className="glass-card p-5 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge tone={STATUS_TONE[p.status] ?? "neutral"}>
              {STATUS_LABEL[p.status] ?? p.status}
            </Badge>
            {p.template && (
              <span className="text-xs text-[#8b8fa3]">
                {p.template.iconEmoji} {p.template.displayName}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-[#8b8fa3]">
              <Calendar className="h-3.5 w-3.5" />
              Início: {formatDate(p.startDate)}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-[#8b8fa3]">
              <Clock className="h-3.5 w-3.5" />
              Prazo: {formatDate(p.estimatedEndDate)}
            </span>
            {p.briefing?.aiEstimatedHours && (
              <span className="inline-flex items-center gap-1 text-xs text-violet-300">
                <TrendingUp className="h-3.5 w-3.5" />
                {p.briefing.aiEstimatedHours}h estimadas
              </span>
            )}
            {p.briefing?.aiEstimatedCostCents && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-300">
                <DollarSign className="h-3.5 w-3.5" />
                {formatBRL(p.briefing.aiEstimatedCostCents)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {p.repositoryUrl && (
              <a
                href={p.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-[#c4c8d8] hover:text-white"
              >
                <Github className="h-3.5 w-3.5" /> Repo
              </a>
            )}
            {p.demoUrl && (
              <a
                href={p.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-[#c4c8d8] hover:text-white"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Demo
              </a>
            )}
            {p.productionUrl && (
              <a
                href={p.productionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-emerald-500/15 text-emerald-300 text-xs font-medium hover:bg-emerald-500/20"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Produção
              </a>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-white">Progresso do projeto</h3>
            <span className="text-2xl font-bold text-violet-300">{p.progress}%</span>
          </div>
          <div className="h-3 rounded-full bg-white/[0.05] overflow-hidden">
            <div
              className="h-full rounded-full brand-gradient transition-all"
              style={{ width: `${p.progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-[#8b8fa3] mt-2">
            <span>
              {p.stages.filter((s: any) => s.status === "completed").length} de {p.stages.length} estágios concluídos
            </span>
            {p.deliveredAt && (
              <span className="text-emerald-300">
                Entregue em {formatDate(p.deliveredAt)}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Left sidebar (1 col) */}
          <div className="space-y-5">
            {/* Cliente */}
            {p.briefing && (
              <div className="glass-card p-4">
                <h3 className="text-xs font-semibold text-white mb-3 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-violet-300" /> Cliente
                </h3>
                <dl className="space-y-1.5 text-xs">
                  <div>
                    <dt className="text-[#6b7280]">Nome</dt>
                    <dd className="text-white">{p.briefing.clientName}</dd>
                  </div>
                  {p.briefing.clientCompany && (
                    <div>
                      <dt className="text-[#6b7280]">Empresa</dt>
                      <dd className="text-white">{p.briefing.clientCompany}</dd>
                    </div>
                  )}
                  <div className="flex items-start gap-1">
                    <Mail className="h-3 w-3 text-[#6b7280] mt-0.5" />
                    <dd className="text-white truncate">{p.briefing.clientEmail}</dd>
                  </div>
                </dl>
              </div>
            )}

            {/* Stack */}
            {stack.length > 0 && (
              <div className="glass-card p-4">
                <h3 className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-violet-300" /> Stack
                </h3>
                <div className="flex flex-wrap gap-1">
                  {stack.map((s: string) => (
                    <span
                      key={s}
                      className="rounded-md bg-white/5 border border-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-violet-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {features.length > 0 && (
              <div className="glass-card p-4">
                <h3 className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                  <ListChecks className="h-3.5 w-3.5 text-violet-300" /> Features
                </h3>
                <ul className="space-y-1">
                  {features.map((f: string, i: number) => (
                    <li key={i} className="text-[11px] text-[#c4c8d8] flex items-start gap-1">
                      <span className="text-emerald-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Team */}
            <div className="glass-card p-4">
              <h3 className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-violet-300" /> Equipe do projeto
              </h3>
              {teamMembers.length === 0 ? (
                <p className="text-[10px] text-[#6b7280]">
                  Nenhum membro atribuído ainda. Atribua nos estágios abaixo.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {teamMembers.map((m: any) => (
                    <li key={m.id} className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/15 text-violet-200 text-[10px] font-semibold">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] text-white truncate">{m.name}</div>
                        <div className="text-[9px] text-[#6b7280]">{m.jobTitle ?? m.email}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Project info editable */}
            <ProjectInfo
              projectId={p.id}
              repositoryUrl={p.repositoryUrl}
              demoUrl={p.demoUrl}
              productionUrl={p.productionUrl}
            />
          </div>

          {/* Kanban (3 cols) */}
          <div className="lg:col-span-3">
            <KanbanBoard
              stages={p.stages}
              companyUsers={companyUsers ?? []}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
