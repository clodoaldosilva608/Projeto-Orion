import DashboardLayout from "../../dashboard/layout";
import { PageHeader, Badge } from "@/components/ui-parts";
import { Crown, Trophy, Medal } from "lucide-react";
import Link from "next/link";
import { getCompanyLeaderboardAction } from "@/lib/gamification-actions";
import { LeaderboardTabs } from "./LeaderboardTabs";

export const dynamic = "force-dynamic";

function formatPoints(n: number): string {
  return n.toLocaleString("pt-BR");
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const period = (params.period as "month" | "all") || "month";
  const { data: rows, error } = await getCompanyLeaderboardAction(period);
  const list = rows ?? [];

  const top3 = list.slice(0, 3);
  const rest = list.slice(3);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <PageHeader
          title="Ranking de Pontos"
          description="Ranking dos colaboradores por pontos acumulados (gamificação)."
          icon={Crown}
        />

        <LeaderboardTabs current={period} />

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {list.length === 0 ? (
          <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4">
              <Crown className="h-8 w-8 text-[#6b7280]" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Ranking vazio</h3>
            <p className="text-sm text-[#8b8fa3] mb-4">
              Nenhum ponto distribuído {period === "month" ? "neste mês" : "ainda"}.
            </p>
            <p className="text-xs text-[#6b7280]">
              Pontos são ganhos automaticamente ao lançar resultados, bater metas, participar de campanhas, etc.
            </p>
          </div>
        ) : (
          <>
            {/* Podium */}
            {top3.length >= 3 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 2nd */}
                <PodiumCard entry={top3[1]} position={2} />
                {/* 1st */}
                <PodiumCard entry={top3[0]} position={1} />
                {/* 3rd */}
                <PodiumCard entry={top3[2]} position={3} />
              </div>
            )}

            {/* Rest of leaderboard */}
            <div className="glass-card p-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
                <Trophy className="h-4 w-4 text-violet-300" />
                <h3 className="text-sm font-semibold text-white">Classificação completa</h3>
                <span className="text-xs text-[#6b7280] ml-auto">{list.length} participantes</span>
              </div>
              <ul className="divide-y divide-white/[0.04]">
                {(top3.length >= 3 ? rest : list).map((entry: any, idx: number) => {
                  const position = top3.length >= 3 ? idx + 4 : idx + 1;
                  return (
                    <li key={entry.userId} className="px-5 py-3.5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300 font-bold text-sm shrink-0">
                        {position}
                      </div>
                      {entry.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={entry.avatarUrl} alt="" className="h-9 w-9 rounded-full" />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/15 text-violet-200 text-xs font-semibold">
                          {initials(entry.name)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{entry.name}</div>
                        <div className="text-xs text-[#8b8fa3] truncate">{entry.jobTitle ?? entry.email}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-white">{formatPoints(entry.points)}</div>
                        <div className="text-[10px]" style={{ color: entry.level.color }}>
                          {entry.level.icon} {entry.level.name}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function PodiumCard({ entry, position }: { entry: any; position: number }) {
  const isFirst = position === 1;
  const podiumColors: Record<number, { bg: string; ring: string; medal: string }> = {
    1: { bg: "from-amber-500/20 to-yellow-500/10", ring: "ring-amber-400/40", medal: "🥇" },
    2: { bg: "from-slate-400/20 to-slate-500/10", ring: "ring-slate-300/30", medal: "🥈" },
    3: { bg: "from-orange-600/20 to-amber-700/10", ring: "ring-orange-500/30", medal: "🥉" },
  };
  const c = podiumColors[position];
  return (
    <div className={`rounded-xl p-5 bg-gradient-to-br ${c.bg} ring-1 ${c.ring} ${isFirst ? "md:scale-105 md:-mt-3" : ""} flex flex-col items-center text-center`}>
      <div className="text-3xl mb-2">{c.medal}</div>
      {entry.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={entry.avatarUrl} alt="" className={`h-14 w-14 rounded-full mb-2 ${isFirst ? "ring-2 ring-amber-400/60" : ""}`} />
      ) : (
        <div className={`h-14 w-14 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-200 font-bold ${isFirst ? "ring-2 ring-amber-400/60" : ""}`}>
          {initials(entry.name)}
        </div>
      )}
      <div className="text-sm font-bold text-white">{entry.name}</div>
      <div className="text-xs text-[#8b8fa3]">{entry.jobTitle ?? "—"}</div>
      <div className="mt-3 text-2xl font-bold" style={{ color: entry.level.color }}>
        {formatPoints(entry.points)}
      </div>
      <div className="text-[10px] text-[#8b8fa3] uppercase tracking-wide">
        {entry.level.icon} {entry.level.name}
      </div>
      {isFirst && (
        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
          <Crown className="h-3 w-3" /> Campeão
        </div>
      )}
    </div>
  );
}
