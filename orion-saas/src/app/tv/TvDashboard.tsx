"use client";

import { useEffect, useState } from "react";
import { Crown, Trophy, Target, Users, Sparkles, Award, TrendingUp, Clock } from "lucide-react";

type TvData = {
  company: { id: string; name: string };
  now: string;
  ranking: Array<{
    position: number;
    userId: string;
    name: string;
    jobTitle: string | null;
    avatarUrl: string | null;
    points: number;
    level: { key: string; name: string; color: string; icon: string; minPoints: number };
  }>;
  top3: Array<{
    position: number;
    name: string;
    jobTitle: string | null;
    avatarUrl: string | null;
    points: number;
    level: { key: string; name: string; color: string; icon: string };
  }>;
  activeCampaigns: Array<{
    id: string;
    name: string;
    description: string | null;
    endDate: string;
    daysLeft: number;
    participantsCount: number;
    awardsCount: number;
  }>;
  upcomingEndings: Array<{
    id: string;
    name: string;
    endDate: string;
    daysLeft: number;
  }>;
  recentApprovals: Array<{
    id: string;
    value: number;
    userName: string;
    userAvatar: string | null;
    goalName: string;
    approvedAt: string | null;
  }>;
  kpis: {
    goals: number;
    approvedResultsThisMonth: number;
    pendingResults: number;
    activeUsers: number;
    indicators: number;
    totalMonthPoints: number;
  };
};

function formatPoints(n: number): string {
  return n.toLocaleString("pt-BR");
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function timeAgo(iso: string | null) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}min atrás`;
  const h = Math.floor(min / 60);
  return `${h}h atrás`;
}

export function TvDashboard({ data: initialData }: { data: TvData }) {
  // Auto-refresh: reload the page every 30 seconds
  const [secondsLeft, setSecondsLeft] = useState(30);
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          // Reload the page to get fresh server-rendered data
          window.location.reload();
          return 30;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const data = initialData;
  const top3 = data.top3;
  const restRanking = data.ranking.slice(3);

  return (
    <div className="h-full flex flex-col gap-4 p-6 overflow-hidden">
      {/* KPIs row */}
      <div className="grid grid-cols-6 gap-3 shrink-0">
        <KpiCard
          icon={<Users className="h-6 w-6" />}
          label="Vendedores ativos"
          value={data.kpis.activeUsers}
          color="#8b5cf6"
        />
        <KpiCard
          icon={<Target className="h-6 w-6" />}
          label="Metas ativas"
          value={data.kpis.goals}
          color="#3b82f6"
        />
        <KpiCard
          icon={<TrendingUp className="h-6 w-6" />}
          label="Resultados no mês"
          value={data.kpis.approvedResultsThisMonth}
          color="#10b981"
        />
        <KpiCard
          icon={<Clock className="h-6 w-6" />}
          label="Aguardando aprovação"
          value={data.kpis.pendingResults}
          color="#f59e0b"
        />
        <KpiCard
          icon={<Trophy className="h-6 w-6" />}
          label="Campanhas ativas"
          value={data.activeCampaigns.length}
          color="#ef4444"
        />
        <KpiCard
          icon={<Sparkles className="h-6 w-6" />}
          label="Pontos no mês"
          value={formatPoints(data.kpis.totalMonthPoints)}
          color="#a78bfa"
        />
      </div>

      {/* Main grid: podium + ranking + side panels */}
      <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Podium (left, 5 cols) */}
        <div className="col-span-5 flex flex-col gap-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-300" />
            Pódio — Top 3
          </h2>
          {top3.length >= 3 ? (
            <div className="grid grid-cols-3 gap-3 flex-1">
              <PodiumCard entry={top3[1]} position={2} />
              <PodiumCard entry={top3[0]} position={1} />
              <PodiumCard entry={top3[2]} position={3} />
            </div>
          ) : top3.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 flex-1">
              {top3.map((entry, idx) => (
                <PodiumCard key={idx} entry={entry} position={idx + 1} />
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] text-[#8b8fa3]">
              <div className="text-center">
                <Trophy className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p className="text-lg">Nenhum ponto distribuído ainda</p>
              </div>
            </div>
          )}
        </div>

        {/* Ranking 4-10 (middle, 4 cols) */}
        <div className="col-span-4 flex flex-col gap-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-violet-300" />
            Classificação
          </h2>
          <div className="flex-1 overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
            {restRanking.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[#8b8fa3]">
                Aguardando mais participantes...
              </div>
            ) : (
              <ul className="divide-y divide-white/[0.04]">
                {restRanking.map((entry) => (
                  <li key={entry.userId} className="px-4 py-3 flex items-center gap-3">
                    <span className="text-2xl font-bold text-[#8b8fa3] w-10 text-center">
                      {entry.position}
                    </span>
                    {entry.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={entry.avatarUrl} alt="" className="h-10 w-10 rounded-full" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/15 text-violet-200 text-sm font-semibold">
                        {initials(entry.name)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-lg font-medium text-white truncate">{entry.name}</div>
                      <div className="text-xs text-[#8b8fa3]">{entry.jobTitle ?? ""}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">{formatPoints(entry.points)}</div>
                      <div className="text-[10px]" style={{ color: entry.level.color }}>
                        {entry.level.icon} {entry.level.name}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right column (3 cols) */}
        <div className="col-span-3 flex flex-col gap-3">
          {/* Active campaigns */}
          <div className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex flex-col gap-2 min-h-0">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 shrink-0">
              <Trophy className="h-4 w-4 text-amber-300" />
              Campanhas ativas
            </h3>
            {data.activeCampaigns.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-[#8b8fa3] text-sm">
                Nenhuma campanha ativa
              </div>
            ) : (
              <ul className="flex-1 overflow-y-auto space-y-2">
                {data.activeCampaigns.map((c) => (
                  <li key={c.id} className="rounded-lg bg-amber-500/[0.06] border border-amber-500/20 p-2.5">
                    <div className="text-sm font-semibold text-white truncate">{c.name}</div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-[#8b8fa3]">{c.participantsCount} particip.</span>
                      <span className={`font-semibold ${c.daysLeft <= 3 ? "text-red-300" : "text-amber-300"}`}>
                        {c.daysLeft === 0 ? "Último dia!" : `${c.daysLeft}d restantes`}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent approvals */}
          <div className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex flex-col gap-2 min-h-0">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 shrink-0">
              <TrendingUp className="h-4 w-4 text-emerald-300" />
              Últimos resultados
            </h3>
            {data.recentApprovals.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-[#8b8fa3] text-sm">
                Nenhum resultado aprovado
              </div>
            ) : (
              <ul className="flex-1 overflow-y-auto space-y-1.5">
                {data.recentApprovals.map((r) => (
                  <li key={r.id} className="text-sm flex items-start gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-semibold shrink-0">
                      {initials(r.userName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-xs truncate">
                        <strong>{r.userName}</strong> · {formatPoints(r.value)}
                      </div>
                      <div className="text-[10px] text-[#6b7280] truncate">
                        {r.goalName} · {timeAgo(r.approvedAt)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar: refresh countdown */}
      <div className="shrink-0 flex items-center justify-between text-xs text-[#6b7280] px-2">
        <span>
          {data.company.name} · Atualizado em {new Date(data.now).toLocaleTimeString("pt-BR")}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 pulse-dot" />
          Próxima atualização em {secondsLeft}s
        </span>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl border p-4 flex flex-col gap-1"
      style={{
        backgroundColor: `${color}11`,
        borderColor: `${color}33`,
      }}
    >
      <div className="flex items-center gap-2" style={{ color }}>
        {icon}
        <span className="text-[10px] uppercase tracking-wide font-semibold">{label}</span>
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </div>
  );
}

function PodiumCard({
  entry,
  position,
}: {
  entry: TvData["top3"][number];
  position: number;
}) {
  const isFirst = position === 1;
  const podiumConfig: Record<number, { bg: string; ring: string; medal: string; height: string }> = {
    1: { bg: "from-amber-500/30 to-yellow-500/10", ring: "ring-amber-400/50", medal: "🥇", height: "h-full" },
    2: { bg: "from-slate-400/25 to-slate-500/10", ring: "ring-slate-300/40", medal: "🥈", height: "h-[85%] self-end" },
    3: { bg: "from-orange-600/25 to-amber-700/10", ring: "ring-orange-500/40", medal: "🥉", height: "h-[75%] self-end" },
  };
  const c = podiumConfig[position];
  return (
    <div className={`rounded-xl bg-gradient-to-b ${c.bg} ring-1 ${c.ring} p-4 flex flex-col items-center text-center ${c.height} justify-center`}>
      <div className="text-5xl mb-2">{c.medal}</div>
      {entry.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={entry.avatarUrl}
          alt=""
          className={`h-16 w-16 rounded-full mb-2 object-cover ${isFirst ? "ring-4 ring-amber-400/60" : "ring-2 ring-white/20"}`}
        />
      ) : (
        <div
          className={`h-16 w-16 rounded-full bg-violet-500/20 flex items-center justify-center text-2xl font-bold text-violet-200 mb-2 ${isFirst ? "ring-4 ring-amber-400/60" : "ring-2 ring-white/20"}`}
        >
          {initials(entry.name)}
        </div>
      )}
      <div className={`font-bold text-white truncate w-full ${isFirst ? "text-xl" : "text-lg"}`}>
        {entry.name}
      </div>
      <div className="text-xs text-[#8b8fa3] mb-2">{entry.jobTitle ?? ""}</div>
      <div className="text-3xl font-bold" style={{ color: entry.level.color }}>
        {formatPoints(entry.points)}
      </div>
      <div className="text-[10px] text-[#8b8fa3] uppercase tracking-wide">
        {entry.level.icon} {entry.level.name}
      </div>
      {isFirst && (
        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
          <Crown className="h-3 w-3" /> CAMPEÃO
        </div>
      )}
    </div>
  );
}
