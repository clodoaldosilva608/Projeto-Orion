import Link from "next/link";
import {
  CheckCircle2,
  Inbox,
  Clock,
  Target,
  CalendarDays,
  AlertCircle,
  User,
} from "lucide-react";
import DashboardLayout from "../dashboard/layout";
import { PageHeader, Badge } from "@/components/ui-parts";
import { ApproveButton, RejectButton } from "./ActionButtons";
import { listResultsAction } from "@/lib/actions";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function initials(name: string) {
  return (name.trim().charAt(0) || "U").toUpperCase();
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  draft: "Rascunho",
  revised: "Revisado",
  approved: "Aprovado",
  rejected: "Rejeitado",
};

export default async function AprovacoesPage() {
  const { data: results, error } = await listResultsAction({
    status: "pending",
  });

  const pendingCount = results?.length ?? 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Aprovações de Resultados"
          description="Revise e aprove os lançamentos pendentes da equipe."
          icon={CheckCircle2}
          action={
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg glass-card">
              <CheckCircle2 className="h-4 w-4 text-violet-300" />
              <span className="text-sm font-medium text-white">
                {pendingCount}{" "}
                {pendingCount === 1 ? "pendente" : "pendentes"}
              </span>
            </div>
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
            href="/resultados"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 h-9 text-xs font-medium text-[#8b8fa3] hover:text-white hover:bg-white/10 transition-colors"
          >
            Resultados
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

        {(!results || results.length === 0) && !error && (
          <div className="glass-card p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-white/5">
              <Inbox className="h-8 w-8 text-[#6b7280]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Nada para aprovar
            </h3>
            <p className="text-sm text-[#8b8fa3] max-w-md mx-auto">
              Não há resultados pendentes no momento. Os novos lançamentos
              aparecerão aqui para revisão.
            </p>
          </div>
        )}

        {results && results.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 stagger">
            {results.map((result) => (
              <div key={result.id} className="glass-card glass-card-hover p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 brand-gradient">
                      {initials(result.user?.name ?? "?")}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">
                        {result.user?.name ?? "—"}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge tone="warning">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {STATUS_LABEL[result.status] ?? "Pendente"}
                        </Badge>
                        {result.user?.email && (
                          <span className="text-[10px] text-[#6b7280] truncate">
                            {result.user.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-white/[0.03]">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-3.5 w-3.5 text-[#6b7280]" />
                      <p className="text-xs text-[#6b7280]">Meta</p>
                    </div>
                    <p className="text-sm font-medium text-white truncate">
                      {result.goal?.name ?? "—"}
                    </p>
                    <p className="text-xs mt-0.5 text-[#8b8fa3] truncate">
                      {result.goal?.indicator?.name ?? "—"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-[#6b7280]">Valor</p>
                      <p className="text-lg font-bold text-violet-300">
                        {Number(result.value).toLocaleString("pt-BR")}{" "}
                        <span className="text-xs font-normal text-[#8b8fa3]">
                          {result.goal?.indicator?.unit ?? ""}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs flex items-center justify-end gap-1 text-[#6b7280]">
                        <CalendarDays className="h-3 w-3" /> Referência
                      </p>
                      <p className="text-sm font-medium text-white">
                        {formatDate(result.referenceDate)}
                      </p>
                    </div>
                  </div>

                  {result.notes && (
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <p className="text-xs italic text-[#8b8fa3]">
                        &quot;{result.notes}&quot;
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-[10px] text-[#6b7280]">
                    <User className="h-3 w-3" />
                    Enviado em {formatDate(result.createdAt)}
                  </div>
                </div>

                <div
                  className="flex items-center justify-end gap-2 pt-4 mt-3"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <RejectButton resultId={result.id} />
                  <ApproveButton resultId={result.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
