import Link from "next/link";
import DashboardLayout from "../dashboard/layout";
import { PageHeader, PageButton, Badge } from "@/components/ui-parts";
import { Trophy, Plus, Users, Award, Calendar, Sparkles, Crown } from "lucide-react";
import { listCampaignsAction } from "@/lib/campanhas-actions";
import { CampaignFilter, DeleteCampaignButton } from "./CampaignClient";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "info" | "violet"> = {
  draft: "neutral",
  scheduled: "info",
  active: "success",
  paused: "warning",
  finished: "info",
  canceled: "danger",
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Rascunho",
  scheduled: "Agendada",
  active: "Ativa",
  paused: "Pausada",
  finished: "Encerrada",
  canceled: "Cancelada",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function CampanhasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filter = (params.filter as "all" | "active" | "finished" | "draft") || "all";
  const { data: campaigns, error } = await listCampaignsAction(filter);
  const list = campaigns ?? [];

  const counts = {
    all: list.length,
    active: list.filter((c: any) => c.status === "active").length,
    finished: list.filter((c: any) => c.status === "finished").length,
    draft: list.filter((c: any) => c.status === "draft").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Campanhas e Premiações"
          description="Crie campanhas motivacionais com premiações, ranking e regras customizadas para sua equipe."
          icon={Trophy}
          action={
            <Link href="/campanhas/nova">
              <PageButton>
                <Plus className="h-4 w-4" />
                Nova Campanha
              </PageButton>
            </Link>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 text-xs text-[#8b8fa3] uppercase tracking-wide">
              <Trophy className="h-3.5 w-3.5" /> Total
            </div>
            <div className="text-2xl font-bold text-white mt-1">{list.length}</div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 text-xs text-[#8b8fa3] uppercase tracking-wide">
              <Sparkles className="h-3.5 w-3.5" /> Ativas
            </div>
            <div className="text-2xl font-bold text-emerald-300 mt-1">{counts.active}</div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 text-xs text-[#8b8fa3] uppercase tracking-wide">
              <Users className="h-3.5 w-3.5" /> Participantes
            </div>
            <div className="text-2xl font-bold text-violet-300 mt-1">
              {list.reduce((acc: number, c: any) => acc + c.participantsCount, 0)}
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 text-xs text-[#8b8fa3] uppercase tracking-wide">
              <Award className="h-3.5 w-3.5" /> Premiações
            </div>
            <div className="text-2xl font-bold text-amber-300 mt-1">
              {list.reduce((acc: number, c: any) => acc + c.awardsCount, 0)}
            </div>
          </div>
        </div>

        {/* Filter */}
        <CampaignFilter current={filter} counts={counts} />

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* List */}
        {list.length === 0 ? (
          <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4">
              <Trophy className="h-8 w-8 text-[#6b7280]" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Nenhuma campanha ainda</h3>
            <p className="text-sm text-[#8b8fa3] mb-4">Crie sua primeira campanha para engajar sua equipe.</p>
            <Link href="/campanhas/nova">
              <PageButton>
                <Plus className="h-4 w-4" />
                Criar campanha
              </PageButton>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {list.map((c: any) => {
              const tone = STATUS_TONE[c.status] ?? "neutral";
              return (
                <div
                  key={c.id}
                  className="glass-card p-5 flex flex-col gap-3 fade-in-up hover:border-violet-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300 shrink-0">
                        <Trophy className="h-4 w-4" />
                      </div>
                      <h3 className="text-sm font-semibold text-white truncate">{c.name}</h3>
                    </div>
                    <Badge tone={tone}>{STATUS_LABEL[c.status] ?? c.status}</Badge>
                  </div>

                  {c.description && (
                    <p className="text-xs text-[#8b8fa3] line-clamp-2">{c.description}</p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-[#8b8fa3]">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(c.startDate)} → {formatDate(c.endDate)}
                    </span>
                  </div>

                  {c.isOngoing && (
                    <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-300 w-fit">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
                      {c.daysLeft} {c.daysLeft === 1 ? "dia restante" : "dias restantes"}
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-2 border-t border-white/[0.06] text-xs">
                    <span className="inline-flex items-center gap-1.5 text-[#8b8fa3]">
                      <Users className="h-3.5 w-3.5" />
                      {c.participantsCount} participantes
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[#8b8fa3]">
                      <Award className="h-3.5 w-3.5" />
                      {c.awardsCount} prêmios
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[#8b8fa3]">
                      <Crown className="h-3.5 w-3.5" />
                      {c.goalsCount} metas
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href={`/campanhas/${c.id}`}
                      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-violet-500/15 text-violet-300 text-xs font-medium hover:bg-violet-500/20 transition-colors flex-1 justify-center"
                    >
                      Ver detalhes
                    </Link>
                    <DeleteCampaignButton id={c.id} name={c.name} />
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
