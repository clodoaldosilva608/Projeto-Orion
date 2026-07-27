import Link from "next/link";
import {
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";
import DashboardLayout from "../dashboard/layout";
import { PageHeader, Badge } from "@/components/ui-parts";
import { SubmitResultForm } from "./SubmitResultForm";
import { listResultsAction, listGoalsAction } from "@/lib/actions";

export const dynamic = "force-dynamic";

const STATUS_META: Record<
  string,
  { label: string; tone: "warning" | "success" | "danger" | "info"; icon: typeof Clock }
> = {
  pending: { label: "Pendente", tone: "warning", icon: Clock },
  approved: { label: "Aprovado", tone: "success", icon: CheckCircle2 },
  rejected: { label: "Rejeitado", tone: "danger", icon: XCircle },
  draft: { label: "Rascunho", tone: "info", icon: Clock },
  revised: { label: "Revisado", tone: "info", icon: Clock },
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function initials(name: string) {
  return name
    .trim()
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function ResultadosPage() {
  const [resultsRes, goalsRes] = await Promise.all([
    listResultsAction(),
    listGoalsAction(),
  ]);

  const results = resultsRes.data ?? [];
  const goals = goalsRes.data ?? [];
  const error = resultsRes.error || goalsRes.error;

  const pendingCount = results.filter(
    (r) => r.status === "pending" || r.status === "draft" || r.status === "revised",
  ).length;
  const approvedCount = results.filter((r) => r.status === "approved").length;
  const rejectedCount = results.filter((r) => r.status === "rejected").length;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Lançamento de Resultados"
          description="Registre seus resultados e acompanhe o histórico da equipe."
          icon={TrendingUp}
          action={
            pendingCount > 0 ? (
              <Link
                href="/aprovacoes"
                className="inline-flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-4 h-10 text-sm font-medium text-violet-300 hover:bg-violet-500/15 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
                {pendingCount} pendente{pendingCount !== 1 ? "s" : ""} para aprovar
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : undefined
          }
        />

        {/* Quick navigation */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/metas"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 h-9 text-xs font-medium text-[#8b8fa3] hover:text-white hover:bg-white/10 transition-colors"
          >
            Metas
          </Link>
          <Link
            href="/indicadores"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 h-9 text-xs font-medium text-[#8b8fa3] hover:text-white hover:bg-white/10 transition-colors"
          >
            Indicadores
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

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card glass-card-hover p-5">
            <p className="text-sm text-[#8b8fa3]">Total lançado</p>
            <p className="text-2xl font-bold text-white mt-1">{results.length}</p>
            <p className="text-xs text-emerald-400 mt-1.5">resultados</p>
          </div>
          <div className="glass-card glass-card-hover p-5">
            <p className="text-sm text-[#8b8fa3]">Pendentes</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">
              {pendingCount}
            </p>
            <p className="text-xs text-[#8b8fa3] mt-1.5">aguardando</p>
          </div>
          <div className="glass-card glass-card-hover p-5">
            <p className="text-sm text-[#8b8fa3]">Aprovados</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              {approvedCount}
            </p>
            <p className="text-xs text-[#8b8fa3] mt-1.5">no ranking</p>
          </div>
          <div className="glass-card glass-card-hover p-5">
            <p className="text-sm text-[#8b8fa3]">Rejeitados</p>
            <p className="text-2xl font-bold text-red-400 mt-1">
              {rejectedCount}
            </p>
            <p className="text-xs text-[#8b8fa3] mt-1.5">recusados</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Lado Esquerdo: Formulário */}
          <div className="lg:col-span-1">
            <SubmitResultForm goals={goals} />
          </div>

          {/* Lado Direito: Lista de Resultados */}
          <div className="lg:col-span-2">
            <div className="glass-card p-5 lg:p-6 min-h-[500px]">
              <h3 className="font-semibold text-white mb-5 flex items-center gap-2 pb-2 border-b border-white/[0.06]">
                <TrendingUp className="h-4 w-4 text-violet-300" />
                Histórico de Resultados
              </h3>

              {results.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-3 bg-white/5">
                    <TrendingUp className="h-7 w-7 text-[#6b7280]" />
                  </div>
                  <p className="text-sm text-[#8b8fa3]">
                    Nenhum resultado lançado ainda.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
                  {results.map((result) => {
                    const meta = STATUS_META[result.status] ?? STATUS_META.pending;
                    const Icon = meta.icon;
                    return (
                      <div
                        key={result.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 brand-gradient">
                            {initials(result.user?.name ?? "?")}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-white font-medium truncate">
                              {result.user?.name ?? "—"}{" "}
                              <span className="text-[#8b8fa3] font-normal">
                                lançou
                              </span>{" "}
                              <span className="text-violet-300 font-semibold">
                                {Number(result.value).toLocaleString("pt-BR")}
                              </span>{" "}
                              <span className="text-[#8b8fa3] font-normal">
                                {result.goal?.indicator?.unit ?? ""}
                              </span>
                            </p>
                            <p className="text-xs mt-0.5 text-[#8b8fa3] truncate">
                              {result.goal?.name ?? "—"} • ref.{" "}
                              {formatDateTime(result.referenceDate)}
                            </p>
                            {result.notes && (
                              <p className="text-xs mt-1 italic text-[#6b7280] truncate">
                                &quot;{result.notes}&quot;
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <Badge tone={meta.tone}>
                            <Icon className="h-3 w-3 inline mr-1" />
                            {meta.label}
                          </Badge>
                          <span className="text-[10px] text-[#6b7280]">
                            {formatDateTime(result.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
