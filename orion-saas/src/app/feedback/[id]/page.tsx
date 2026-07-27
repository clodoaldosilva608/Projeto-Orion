import Link from "next/link";
import { notFound } from "next/navigation";
import DashboardLayout from "../../dashboard/layout";
import { PageHeader, Badge } from "@/components/ui-parts";
import { ArrowLeft, BarChart3, MessageSquare, Star, Users } from "lucide-react";
import { getFeedbackAction } from "@/lib/feedback-actions";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  nps: "NPS (0-10)",
  csat: "CSAT (1-5)",
  ces: "CES (1-7)",
  rating: "Avaliação (1-5 ⭐)",
  open: "Resposta aberta",
  multiple_choice: "Múltipla escolha",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default async function FeedbackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: feedback, error } = await getFeedbackAction(id);

  if (error || !feedback) {
    notFound();
  }

  const f: any = feedback;
  const a = f.analytics;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <Link
          href="/feedback/admin"
          className="inline-flex items-center gap-1.5 text-xs text-[#8b8fa3] hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para gerenciar pesquisas
        </Link>

        <PageHeader
          title={f.title}
          description={`${TYPE_LABEL[f.type] ?? f.type} · ${a.total} resposta(s)`}
          icon={BarChart3}
        />

        {/* Analytics summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Total respostas</div>
            <div className="text-2xl font-bold text-white mt-1">{a.total}</div>
          </div>
          {a.averageNumeric != null && (
            <div className="glass-card p-4">
              <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Média</div>
              <div className="text-2xl font-bold text-violet-300 mt-1">
                {a.averageNumeric.toFixed(2)}
              </div>
            </div>
          )}
          {a.npsScore != null && (
            <div className="glass-card p-4">
              <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">NPS Score</div>
              <div className={`text-2xl font-bold mt-1 ${
                a.npsScore >= 50 ? "text-emerald-300" : a.npsScore >= 0 ? "text-amber-300" : "text-red-300"
              }`}>
                {a.npsScore > 0 ? "+" : ""}{a.npsScore}
              </div>
            </div>
          )}
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Tipo</div>
            <div className="text-2xl font-bold text-amber-300 mt-1">
              {TYPE_LABEL[f.type]?.split(" ")[0] ?? f.type}
            </div>
          </div>
        </div>

        {/* NPS breakdown */}
        {f.type === "nps" && a.total > 0 && (
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Distribuição NPS</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-red-500/20 bg-red-500/[0.06] p-3 text-center">
                <div className="text-xs text-[#8b8fa3]">Detratores (0-6)</div>
                <div className="text-2xl font-bold text-red-300 mt-1">{a.npsDetractors}</div>
                <div className="text-[10px] text-[#6b7280]">
                  {a.total > 0 ? Math.round((a.npsDetractors / a.total) * 100) : 0}%
                </div>
              </div>
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-3 text-center">
                <div className="text-xs text-[#8b8fa3]">Passivos (7-8)</div>
                <div className="text-2xl font-bold text-amber-300 mt-1">{a.npsPassives}</div>
                <div className="text-[10px] text-[#6b7280]">
                  {a.total > 0 ? Math.round((a.npsPassives / a.total) * 100) : 0}%
                </div>
              </div>
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] p-3 text-center">
                <div className="text-xs text-[#8b8fa3]">Promotores (9-10)</div>
                <div className="text-2xl font-bold text-emerald-300 mt-1">{a.npsPromoters}</div>
                <div className="text-[10px] text-[#6b7280]">
                  {a.total > 0 ? Math.round((a.npsPromoters / a.total) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Distribution chart */}
        {a.distribution && Object.keys(a.distribution).length > 0 && (
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Distribuição de respostas</h3>
            <div className="space-y-2">
              {Object.entries(a.distribution)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([value, count]: [string, any]) => {
                  const pct = a.total > 0 ? (Number(count) / a.total) * 100 : 0;
                  return (
                    <div key={value} className="flex items-center gap-3">
                      <span className="text-sm font-mono text-white w-8">{value}</span>
                      <div className="flex-1 h-6 rounded-md bg-white/[0.05] overflow-hidden">
                        <div
                          className="h-full brand-gradient flex items-center justify-end pr-2"
                          style={{ width: `${Math.max(pct, 5)}%` }}
                        >
                          <span className="text-[10px] font-semibold text-white">{count as number}</span>
                        </div>
                      </div>
                      <span className="text-xs text-[#8b8fa3] w-10 text-right">{Math.round(pct)}%</span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Individual responses */}
        <div className="glass-card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-violet-300" />
            <h3 className="text-sm font-semibold text-white">Respostas individuais</h3>
            <span className="text-xs text-[#6b7280] ml-auto">{f.responses.length} exibidas</span>
          </div>

          {f.responses.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-[#8b8fa3]">
              Nenhuma resposta recebida ainda.
            </div>
          ) : (
            <ul className="divide-y divide-white/[0.04] max-h-[500px] overflow-y-auto">
              {f.responses.map((r: any) => (
                <li key={r.id} className="px-5 py-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/15 text-violet-200 text-xs font-semibold shrink-0">
                      {r.user ? r.user.name.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-white">
                          {r.user ? r.user.name : "Anônimo"}
                        </span>
                        <span className="text-[10px] text-[#6b7280]">{formatDate(r.createdAt)}</span>
                      </div>
                      <div className="text-sm text-[#c4c8d8] mt-1">
                        {r.numericValue != null && (
                          <span className="inline-flex items-center gap-1">
                            {f.type === "rating" ? (
                              <>
                                {"⭐".repeat(r.numericValue)}
                                <span className="text-xs text-[#8b8fa3] ml-1">({r.numericValue}/5)</span>
                              </>
                            ) : f.type === "nps" ? (
                              <span className="font-semibold">{r.numericValue}/10</span>
                            ) : (
                              <span className="font-semibold">{r.numericValue}</span>
                            )}
                          </span>
                        )}
                        {r.selectedOption != null && (
                          <span className="font-medium">
                            {(f.options as string[])[r.selectedOption] ?? `Opção ${r.selectedOption + 1}`}
                          </span>
                        )}
                        {r.textValue && (
                          <p className="text-sm text-[#c4c8d8] mt-1">{r.textValue}</p>
                        )}
                      </div>
                      {r.comment && (
                        <p className="text-xs text-[#8b8fa3] mt-1 italic">"{r.comment}"</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
