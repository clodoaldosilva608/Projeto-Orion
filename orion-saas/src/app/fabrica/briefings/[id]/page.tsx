import Link from "next/link";
import { notFound } from "next/navigation";
import DashboardLayout from "../../../dashboard/layout";
import { PageHeader, Badge } from "@/components/ui-parts";
import {
  ArrowLeft, Sparkles, FileText, Clock, DollarSign, Layers,
  CheckCircle2, AlertCircle, User, Mail, Phone, Building2,
  Target, ListChecks, TrendingUp, Calendar,
} from "lucide-react";
import { getBriefingAction, listProjectTemplatesAction } from "@/lib/fabrica-actions";
import {
  GenerateIaButton,
  ApproveBriefingForm,
  RejectBriefingButton,
  CopyButton,
} from "./BriefingDetailClient";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "info" | "violet"> = {
  draft: "neutral",
  ai_processing: "violet",
  reviewed: "info",
  approved: "success",
  rejected: "danger",
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Rascunho",
  ai_processing: "IA processando",
  reviewed: "IA gerou — aguardando aprovação",
  approved: "Aprovado — projeto criado",
  rejected: "Rejeitado",
};

function formatBRL(cents: number | null): string {
  if (!cents) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(cents / 100);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export default async function BriefingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ data: briefing, error }, { data: templates }] = await Promise.all([
    getBriefingAction(id),
    listProjectTemplatesAction(),
  ]);

  if (error || !briefing) {
    notFound();
  }

  const b: any = briefing;
  const features = (b.keyFeatures as string[]) ?? [];
  const stackSuggestion = (b.aiStackSuggestion as string[]) ?? [];
  const isProcessing = b.status === "ai_processing";
  const hasIaContent = !!b.aiGeneratedDoc;
  const canApprove = b.status === "reviewed";

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <Link
          href="/fabrica/briefings"
          className="inline-flex items-center gap-1.5 text-xs text-[#8b8fa3] hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para briefings
        </Link>

        <PageHeader
          title={`Briefing — ${b.clientName}`}
          description={`Criado em ${formatDate(b.createdAt)}`}
          icon={FileText}
        />

        {/* Status banner */}
        <div className={`glass-card p-5 flex items-start gap-3 ${
          isProcessing ? "border-violet-500/30" :
          b.status === "approved" ? "border-emerald-500/30" :
          b.status === "rejected" ? "border-red-500/30" :
          hasIaContent ? "border-sky-500/30" : ""
        }`}>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
            isProcessing ? "bg-violet-500/15 text-violet-300" :
            b.status === "approved" ? "bg-emerald-500/15 text-emerald-300" :
            b.status === "rejected" ? "bg-red-500/15 text-red-300" :
            hasIaContent ? "bg-sky-500/15 text-sky-300" : "bg-white/5 text-[#8b8fa3]"
          }`}>
            {isProcessing ? <Clock className="h-5 w-5 animate-pulse" /> :
             b.status === "approved" ? <CheckCircle2 className="h-5 w-5" /> :
             b.status === "rejected" ? <AlertCircle className="h-5 w-5" /> :
             hasIaContent ? <Sparkles className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-white">{STATUS_LABEL[b.status] ?? b.status}</h3>
              <Badge tone={STATUS_TONE[b.status] ?? "neutral"}>{b.status}</Badge>
            </div>
            {isProcessing ? (
              <p className="text-xs text-[#8b8fa3]">
                A IA está gerando o PRD + arquitetura + estimativas. Isso pode levar 10-20 segundos.
                A página atualiza automaticamente.
              </p>
            ) : b.status === "draft" ? (
              <p className="text-xs text-[#8b8fa3] mb-3">
                Briefing salvo. Clique no botão abaixo para gerar PRD + arquitetura + estimativas via IA.
              </p>
            ) : hasIaContent ? (
              <p className="text-xs text-[#8b8fa3]">
                IA gerou o conteúdo. Revise abaixo e aprove para criar o projeto automaticamente.
              </p>
            ) : null}
          </div>
          {b.status === "draft" && (
            <GenerateIaButton briefingId={b.id} />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Briefing original (left, 1 col) */}
          <div className="space-y-5">
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-violet-300" /> Cliente
              </h3>
              <dl className="space-y-2 text-xs">
                <div>
                  <dt className="text-[#6b7280]">Nome</dt>
                  <dd className="text-white">{b.clientName}</dd>
                </div>
                {b.clientCompany && (
                  <div className="flex items-start gap-1.5">
                    <Building2 className="h-3 w-3 text-[#6b7280] mt-0.5" />
                    <dd className="text-white">{b.clientCompany}</dd>
                  </div>
                )}
                <div className="flex items-start gap-1.5">
                  <Mail className="h-3 w-3 text-[#6b7280] mt-0.5" />
                  <dd className="text-white">{b.clientEmail}</dd>
                </div>
                {b.clientPhone && (
                  <div className="flex items-start gap-1.5">
                    <Phone className="h-3 w-3 text-[#6b7280] mt-0.5" />
                    <dd className="text-white">{b.clientPhone}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-violet-300" /> Problema
              </h3>
              <p className="text-xs text-[#c4c8d8]">{b.problemStatement}</p>
              {b.targetAudience && (
                <div className="mt-3 pt-3 border-t border-white/[0.06]">
                  <div className="text-[10px] text-[#6b7280] uppercase tracking-wide mb-1">Público-alvo</div>
                  <p className="text-xs text-[#c4c8d8]">{b.targetAudience}</p>
                </div>
              )}
              {b.successCriteria && (
                <div className="mt-3 pt-3 border-t border-white/[0.06]">
                  <div className="text-[10px] text-[#6b7280] uppercase tracking-wide mb-1">Critérios de sucesso</div>
                  <p className="text-xs text-[#c4c8d8]">{b.successCriteria}</p>
                </div>
              )}
            </div>

            {features.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-violet-300" /> Features solicitadas
                </h3>
                <ul className="space-y-1">
                  {features.map((f, i) => (
                    <li key={i} className="text-xs text-[#c4c8d8] flex items-start gap-2">
                      <span className="text-emerald-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-violet-300" /> Estimativas do cliente
              </h3>
              <dl className="space-y-2 text-xs">
                {b.budgetCents ? (
                  <div className="flex items-center justify-between">
                    <dt className="text-[#6b7280]">Orçamento</dt>
                    <dd className="text-emerald-300 font-semibold">{formatBRL(b.budgetCents)}</dd>
                  </div>
                ) : null}
                {b.timelineWeeks ? (
                  <div className="flex items-center justify-between">
                    <dt className="text-[#6b7280]">Prazo desejado</dt>
                    <dd className="text-white font-semibold">{b.timelineWeeks} semanas</dd>
                  </div>
                ) : null}
                {b.projectType && (
                  <div className="flex items-center justify-between">
                    <dt className="text-[#6b7280]">Tipo</dt>
                    <dd className="text-white">{b.projectType}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* IA Generated content (right, 2 cols) */}
          <div className="lg:col-span-2 space-y-5">
            {isProcessing ? (
              <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
                <Sparkles className="h-12 w-12 text-violet-300 animate-pulse mb-4" />
                <h3 className="text-base font-semibold text-white mb-1">IA processando...</h3>
                <p className="text-sm text-[#8b8fa3]">Gerando PRD, arquitetura e estimativas</p>
                <div className="mt-4 flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-2 w-2 rounded-full bg-violet-400 animate-pulse"
                      style={{ animationDelay: `${i * 200}ms` }}
                    />
                  ))}
                </div>
              </div>
            ) : hasIaContent ? (
              <>
                {/* IA estimativas */}
                {(b.aiEstimatedHours || b.aiEstimatedCostCents) && (
                  <div className="grid grid-cols-3 gap-4">
                    {b.aiEstimatedHours && (
                      <div className="glass-card p-4">
                        <div className="text-xs text-[#8b8fa3] uppercase tracking-wide flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Horas estimadas
                        </div>
                        <div className="text-2xl font-bold text-violet-300 mt-1">
                          {b.aiEstimatedHours}h
                        </div>
                      </div>
                    )}
                    {b.aiEstimatedCostCents && (
                      <div className="glass-card p-4">
                        <div className="text-xs text-[#8b8fa3] uppercase tracking-wide flex items-center gap-1">
                          <DollarSign className="h-3 w-3" /> Custo estimado
                        </div>
                        <div className="text-2xl font-bold text-emerald-300 mt-1">
                          {formatBRL(b.aiEstimatedCostCents)}
                        </div>
                      </div>
                    )}
                    {stackSuggestion.length > 0 && (
                      <div className="glass-card p-4">
                        <div className="text-xs text-[#8b8fa3] uppercase tracking-wide flex items-center gap-1">
                          <Layers className="h-3 w-3" /> Stack sugerida
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {stackSuggestion.slice(0, 4).map((s) => (
                            <span
                              key={s}
                              className="rounded-md bg-white/5 border border-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-violet-200"
                            >
                              {s}
                            </span>
                          ))}
                          {stackSuggestion.length > 4 && (
                            <span className="text-[10px] text-[#6b7280]">+{stackSuggestion.length - 4}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* PRD */}
                {b.aiGeneratedDoc && (
                  <div className="glass-card p-0 overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-violet-300" />
                        <h3 className="text-sm font-semibold text-white">PRD gerado por IA</h3>
                      </div>
                      <CopyButton text={b.aiGeneratedDoc} />
                    </div>
                    <div className="p-5">
                      <pre className="text-xs text-[#c4c8d8] whitespace-pre-wrap font-mono leading-relaxed">
                        {b.aiGeneratedDoc}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Architecture */}
                {b.aiArchitectureSuggestion && (
                  <div className="glass-card p-0 overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-emerald-300" />
                        <h3 className="text-sm font-semibold text-white">Sugestão de Arquitetura</h3>
                      </div>
                      <CopyButton text={b.aiArchitectureSuggestion} />
                    </div>
                    <div className="p-5">
                      <pre className="text-xs text-[#c4c8d8] whitespace-pre-wrap font-mono leading-relaxed">
                        {b.aiArchitectureSuggestion}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Approve form */}
                {canApprove && (
                  <ApproveBriefingForm briefingId={b.id} templates={templates ?? []} />
                )}

                {b.project && (
                  <div className="glass-card p-5 border-emerald-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      <h3 className="text-sm font-semibold text-white">Projeto criado!</h3>
                    </div>
                    <p className="text-xs text-[#8b8fa3] mb-3">
                      Este briefing foi aprovado e o projeto foi criado automaticamente.
                    </p>
                    <Link
                      href="/fabrica/projetos"
                      className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-emerald-500/15 text-emerald-300 text-xs font-medium hover:bg-emerald-500/20"
                    >
                      Ver projeto →
                    </Link>
                  </div>
                )}

                {b.status === "rejected" && b.reviewNotes && (
                  <div className="glass-card p-5 border-red-500/30">
                    <h3 className="text-sm font-semibold text-white mb-2">Motivo da rejeição</h3>
                    <p className="text-xs text-[#c4c8d8]">{b.reviewNotes}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
                <Sparkles className="h-12 w-12 text-[#6b7280] mb-4" />
                <h3 className="text-base font-semibold text-white mb-1">IA ainda não gerou conteúdo</h3>
                <p className="text-sm text-[#8b8fa3] mb-4 max-w-md">
                  Clique no botão abaixo para que a IA do Orion gere automaticamente
                  o PRD, a sugestão de arquitetura e as estimativas com base no briefing.
                </p>
                <GenerateIaButton briefingId={b.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
