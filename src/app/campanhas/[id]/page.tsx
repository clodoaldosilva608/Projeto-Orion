import Link from "next/link";
import { notFound } from "next/navigation";
import DashboardLayout from "../../dashboard/layout";
import { PageHeader, Badge } from "@/components/ui-parts";
import {
  Trophy, Users, Award, Crown, Calendar, Play, Square, RotateCcw,
  Trash2, Plus, Sparkles, Medal, Target,
} from "lucide-react";
import { getCampaignAction, listCompanyUsersAction } from "@/lib/campanhas-actions";
import {
  StatusButtons, AddParticipantForm, AddAwardForm, AwardList,
  LeaderboardActions,
} from "./CampaignDetailClient";

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

const AWARD_TYPE_LABEL: Record<string, string> = {
  points: "Pontos",
  money: "Dinheiro",
  product: "Produto",
  badge: "Medalha / Badge",
  experience: "Experiência",
  custom: "Personalizado",
};

const AWARD_TYPE_ICON: Record<string, string> = {
  points: "⭐",
  money: "💵",
  product: "📦",
  badge: "🥇",
  experience: "✈️",
  custom: "🎁",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: campaign, error } = await getCampaignAction(id);
  const { data: companyUsers } = await listCompanyUsersAction();

  if (error || !campaign) {
    notFound();
  }

  const c: any = campaign;
  const tone = STATUS_TONE[c.status] ?? "neutral";
  const participantUserIds = new Set(c.participants.map((p: any) => p.userId));
  const availableUsers = (companyUsers ?? []).filter((u: any) => !participantUserIds.has(u.id));

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <PageHeader
          title={c.name}
          description={c.description ?? "Sem descrição"}
          icon={Trophy}
        />

        {/* Top info */}
        <div className="glass-card p-5 lg:p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge tone={tone}>{STATUS_LABEL[c.status] ?? c.status}</Badge>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#8b8fa3]">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(c.startDate)} → {formatDate(c.endDate)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#8b8fa3]">
              <Users className="h-3.5 w-3.5" />
              {c.participants.length} participantes
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#8b8fa3]">
              <Award className="h-3.5 w-3.5" />
              {c.awards.length} prêmios
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#8b8fa3]">
              <Target className="h-3.5 w-3.5" />
              {c.goals.length} metas vinculadas
            </span>
          </div>
          <StatusButtons
            id={c.id}
            status={c.status}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Leaderboard (2 cols) */}
          <div className="lg:col-span-2 space-y-5">
            <div className="glass-card p-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-300" />
                  <h3 className="text-sm font-semibold text-white">Ranking da campanha</h3>
                </div>
                <LeaderboardActions id={c.id} />
              </div>
              {c.participants.length === 0 ? (
                <div className="px-5 py-12 text-center text-sm text-[#8b8fa3]">
                  Sem participantes ainda. Adicione membros da equipe abaixo.
                </div>
              ) : (
                <ul className="divide-y divide-white/[0.04]">
                  {c.participants.map((p: any, idx: number) => {
                    const position = p.rank ?? idx + 1;
                    const isPodium = position <= 3;
                    const podiumColor =
                      position === 1 ? "from-amber-400 to-yellow-500"
                      : position === 2 ? "from-slate-300 to-slate-400"
                      : position === 3 ? "from-orange-400 to-amber-600"
                      : "from-violet-500 to-indigo-500";
                    return (
                      <li key={p.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${podiumColor} text-white font-bold text-sm shrink-0`}>
                          {position <= 3 ? <Medal className="h-4 w-4" /> : position}
                        </div>
                        {p.user.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.user.avatarUrl} alt="" className="h-9 w-9 rounded-full" />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/15 text-violet-200 text-xs font-semibold">
                            {initials(p.user.name)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{p.user.name}</div>
                          <div className="text-xs text-[#8b8fa3] truncate">
                            {p.user.jobTitle ?? p.user.email}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-bold text-white">{p.totalPoints.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</div>
                          <div className="text-[10px] text-[#6b7280] uppercase tracking-wide">pontos</div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Awards list */}
            <AwardList awards={c.awards} campaignId={c.id} />
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Add award */}
            <AddAwardForm campaignId={c.id} />

            {/* Add participant */}
            <AddParticipantForm
              campaignId={c.id}
              availableUsers={availableUsers as any[]}
              participants={c.participants as any[]}
            />

            {/* Goals linked */}
            <div className="glass-card p-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
                <Target className="h-4 w-4 text-violet-300" />
                <h3 className="text-sm font-semibold text-white">Metas vinculadas</h3>
              </div>
              {c.goals.length === 0 ? (
                <div className="px-5 py-6 text-center text-xs text-[#8b8fa3]">
                  Nenhuma meta vinculada. Vincule metas existentes pela página{" "}
                  <Link href="/metas" className="text-violet-300 hover:text-violet-200">Metas</Link>.
                </div>
              ) : (
                <ul className="divide-y divide-white/[0.04]">
                  {c.goals.map((g: any) => (
                    <li key={g.id} className="px-5 py-3">
                      <div className="text-sm font-medium text-white truncate">{g.name}</div>
                      <div className="text-xs text-[#8b8fa3] mt-0.5">
                        {g.indicator?.name ?? "Sem indicador"} · Meta: {g.targetValue.toLocaleString("pt-BR")}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Rules */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-violet-300" />
                <h3 className="text-sm font-semibold text-white">Regras</h3>
              </div>
              <pre className="text-xs font-mono text-violet-200 bg-white/[0.03] rounded-lg p-3 overflow-x-auto max-h-48">
                {JSON.stringify(c.rules ?? {}, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
