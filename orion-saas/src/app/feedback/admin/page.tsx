import Link from "next/link";
import DashboardLayout from "../../dashboard/layout";
import { PageHeader, Badge } from "@/components/ui-parts";
import { MessageSquare, Plus, BarChart3, Settings2 } from "lucide-react";
import { listFeedbacksAction } from "@/lib/feedback-actions";
import { NewFeedbackForm, StatusButtons } from "./AdminClient";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "info" | "violet"> = {
  draft: "neutral",
  active: "success",
  paused: "warning",
  closed: "info",
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Rascunho",
  active: "Ativa",
  paused: "Pausada",
  closed: "Encerrada",
};

const TYPE_LABEL: Record<string, string> = {
  nps: "NPS",
  csat: "CSAT",
  ces: "CES",
  rating: "Avaliação",
  open: "Aberta",
  multiple_choice: "Múltipla escolha",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function FeedbackAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filter = (params.filter as string) || "all";
  const { data: feedbacks, error } = await listFeedbacksAction(filter as any);
  const list = feedbacks ?? [];

  const stats = {
    total: list.length,
    active: list.filter((f: any) => f.status === "active").length,
    draft: list.filter((f: any) => f.status === "draft").length,
    totalResponses: list.reduce((acc: number, f: any) => acc + f.responsesCount, 0),
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1300px] mx-auto">
        <PageHeader
          title="Gerenciar Pesquisas"
          description="Crie e gerencie pesquisas de feedback. Visualize respostas e analytics."
          icon={Settings2}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Total</div>
            <div className="text-2xl font-bold text-white mt-1">{stats.total}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Ativas</div>
            <div className="text-2xl font-bold text-emerald-300 mt-1">{stats.active}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Rascunhos</div>
            <div className="text-2xl font-bold text-[#8b8fa3] mt-1">{stats.draft}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Total respostas</div>
            <div className="text-2xl font-bold text-violet-300 mt-1">{stats.totalResponses}</div>
          </div>
        </div>

        {/* New feedback form */}
        <NewFeedbackForm />

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "Todas" },
            { id: "active", label: "Ativas" },
            { id: "draft", label: "Rascunhos" },
            { id: "closed", label: "Encerradas" },
          ].map((f) => {
            const active = filter === f.id;
            return (
              <Link
                key={f.id}
                href={`/feedback/admin?filter=${f.id}`}
                className={`inline-flex items-center gap-2 h-9 px-3 rounded-lg text-xs font-medium transition-colors ${
                  active
                    ? "bg-violet-500/15 text-white border border-violet-500/30"
                    : "border border-white/[0.06] bg-white/[0.02] text-[#8b8fa3] hover:text-white"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        {/* List */}
        <div className="glass-card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-violet-300" />
            <h3 className="text-sm font-semibold text-white">Pesquisas</h3>
            <span className="text-xs text-[#6b7280] ml-auto">{list.length} pesquisa(s)</span>
          </div>

          {list.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-[#8b8fa3]">
              Nenhuma pesquisa. Use o formulário acima para criar a primeira.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-[#8b8fa3] uppercase tracking-wide border-b border-white/[0.06]">
                  <th className="px-5 py-3 font-medium">Título</th>
                  <th className="px-5 py-3 font-medium">Tipo</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Respostas</th>
                  <th className="px-5 py-3 font-medium">Pontos</th>
                  <th className="px-5 py-3 font-medium">Criada</th>
                  <th className="px-5 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {list.map((f: any) => (
                  <tr key={f.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-3">
                      <div className="text-sm font-medium text-white">{f.title}</div>
                      {f.description && (
                        <div className="text-xs text-[#6b7280] line-clamp-1 mt-0.5">{f.description}</div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm text-[#c4c8d8]">
                      {TYPE_LABEL[f.type] ?? f.type}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={STATUS_TONE[f.status] ?? "neutral"}>
                        {STATUS_LABEL[f.status] ?? f.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/feedback/${f.id}`}
                        className="inline-flex items-center gap-1 text-sm text-violet-300 hover:text-violet-200"
                      >
                        <BarChart3 className="h-3.5 w-3.5" />
                        {f.responsesCount}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-sm text-violet-300">+{f.pointsReward}</td>
                    <td className="px-5 py-3 text-xs text-[#8b8fa3]">{formatDate(f.createdAt)}</td>
                    <td className="px-5 py-3 text-right">
                      <StatusButtons id={f.id} status={f.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="text-center">
          <Link href="/feedback" className="inline-flex items-center text-xs text-[#8b8fa3] hover:text-white">
            ← Voltar para pesquisas disponíveis
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
