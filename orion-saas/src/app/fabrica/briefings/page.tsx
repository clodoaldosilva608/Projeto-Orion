import Link from "next/link";
import DashboardLayout from "../../dashboard/layout";
import { PageHeader, PageButton, Badge } from "@/components/ui-parts";
import { ClipboardList, Plus, FileText, CheckCircle2, XCircle, Clock, Sparkles, ArrowRight } from "lucide-react";
import { listBriefingsAction } from "@/lib/fabrica-actions";
import { GenerateIaButton, DeleteBriefingButton } from "./BriefingsClient";

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
  reviewed: "IA gerou",
  approved: "Aprovado",
  rejected: "Rejeitado",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatBRL(cents: number | null): string {
  if (!cents) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(cents / 100);
}

export default async function BriefingsPage() {
  const { data: briefings, error } = await listBriefingsAction();
  const list = briefings ?? [];

  const stats = {
    total: list.length,
    draft: list.filter((b: any) => b.status === "draft").length,
    aiProcessing: list.filter((b: any) => b.status === "ai_processing").length,
    reviewed: list.filter((b: any) => b.status === "reviewed").length,
    approved: list.filter((b: any) => b.status === "approved").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <PageHeader
          title="Briefings de Projeto"
          description="Briefings estruturados. A IA do Orion gera PRD, arquitetura e estimativas automaticamente."
          icon={ClipboardList}
          action={
            <Link href="/fabrica/briefings/novo">
              <PageButton>
                <Plus className="h-4 w-4" />
                Novo Briefing
              </PageButton>
            </Link>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Total</div>
            <div className="text-2xl font-bold text-white mt-1">{stats.total}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Rascunhos</div>
            <div className="text-2xl font-bold text-[#8b8fa3] mt-1">{stats.draft}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-violet-300" /> IA processando
            </div>
            <div className="text-2xl font-bold text-violet-300 mt-1">{stats.aiProcessing}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">IA gerou</div>
            <div className="text-2xl font-bold text-sky-300 mt-1">{stats.reviewed}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Aprovados</div>
            <div className="text-2xl font-bold text-emerald-300 mt-1">{stats.approved}</div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* List */}
        {list.length === 0 ? (
          <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4">
              <ClipboardList className="h-8 w-8 text-[#6b7280]" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Nenhum briefing ainda</h3>
            <p className="text-sm text-[#8b8fa3] mb-4 max-w-md">
              Crie seu primeiro briefing estruturado. A IA do Orion vai gerar
              automaticamente o PRD, sugestão de arquitetura e estimativas.
            </p>
            <Link
              href="/fabrica/briefings/novo"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg brand-gradient text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Criar primeiro briefing
            </Link>
          </div>
        ) : (
          <div className="glass-card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
              <FileText className="h-4 w-4 text-violet-300" />
              <h3 className="text-sm font-semibold text-white">Briefings</h3>
              <span className="text-xs text-[#6b7280] ml-auto">{list.length} registro(s)</span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-[#8b8fa3] uppercase tracking-wide border-b border-white/[0.06]">
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="px-5 py-3 font-medium">Tipo</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">IA</th>
                  <th className="px-5 py-3 font-medium">Estimativa</th>
                  <th className="px-5 py-3 font-medium">Data</th>
                  <th className="px-5 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {list.map((b: any) => (
                  <tr key={b.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-3">
                      <Link href={`/fabrica/briefings/${b.id}`} className="block">
                        <div className="text-sm font-medium text-white hover:text-violet-300">{b.clientName}</div>
                        <div className="text-[10px] text-[#6b7280]">{b.clientCompany ?? b.clientEmail}</div>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-xs text-[#c4c8d8]">{b.projectType ?? "—"}</td>
                    <td className="px-5 py-3">
                      <Badge tone={STATUS_TONE[b.status] ?? "neutral"}>
                        {STATUS_LABEL[b.status] ?? b.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      {b.aiGeneratedDoc ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Gerado
                        </span>
                      ) : b.status === "ai_processing" ? (
                        <span className="inline-flex items-center gap-1 text-xs text-violet-300">
                          <Clock className="h-3.5 w-3.5 animate-pulse" /> Processando
                        </span>
                      ) : (
                        <span className="text-xs text-[#6b7280]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs">
                      {b.aiEstimatedHours ? (
                        <div>
                          <div className="text-white font-medium">{b.aiEstimatedHours}h</div>
                          <div className="text-emerald-300">{formatBRL(b.aiEstimatedCostCents)}</div>
                        </div>
                      ) : (
                        <span className="text-[#6b7280]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs text-[#8b8fa3]">{formatDate(b.createdAt)}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        {b.status === "draft" && (
                          <GenerateIaButton briefingId={b.id} />
                        )}
                        <Link
                          href={`/fabrica/briefings/${b.id}`}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-[#8b8fa3] hover:text-white hover:bg-white/5"
                          title="Ver detalhes"
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                        {!b.project && (
                          <DeleteBriefingButton id={b.id} clientName={b.clientName} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
