"use client";

import { useEffect, useState } from "react";
import { Crown, Trophy } from "lucide-react";

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
  kpis: { totalMonthPoints: number };
};

function formatPoints(n: number): string {
  return n.toLocaleString("pt-BR");
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function TvRanking({ data: initialData }: { data: TvData }) {
  const [secondsLeft, setSecondsLeft] = useState(30);
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.location.reload();
          return 30;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const data = initialData;
  const podium = data.ranking.slice(0, 3);
  const rest = data.ranking.slice(3);

  return (
    <div className="h-full flex flex-col gap-6 p-8 overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Crown className="h-9 w-9 text-amber-300" />
            Ranking de Vendas
          </h1>
          <p className="text-lg text-[#8b8fa3] mt-1">
            {data.company.name} · Total no mês: {formatPoints(data.kpis.totalMonthPoints)} pontos
          </p>
        </div>
        <div className="text-right text-sm text-[#6b7280]">
          <div>Próxima atualização em {secondsLeft}s</div>
        </div>
      </div>

      {/* Podium (big) */}
      {podium.length >= 3 && (
        <div className="shrink-0 grid grid-cols-3 gap-6 h-[280px]">
          {/* 2nd */}
          <PodiumBig entry={podium[1]} position={2} />
          {/* 1st */}
          <PodiumBig entry={podium[0]} position={1} />
          {/* 3rd */}
          <PodiumBig entry={podium[2]} position={3} />
        </div>
      )}

      {/* Rest of ranking */}
      <div className="flex-1 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        {rest.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[#8b8fa3] text-xl">
            <Trophy className="h-12 w-12 mr-3 opacity-30" />
            Aguardando mais participantes...
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.04]">
            {rest.map((entry) => (
              <li key={entry.userId} className="px-8 py-4 flex items-center gap-6">
                <span className="text-4xl font-bold text-[#8b8fa3] w-16 text-center">
                  {entry.position}
                </span>
                {entry.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={entry.avatarUrl} alt="" className="h-14 w-14 rounded-full" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/15 text-violet-200 text-lg font-semibold">
                    {initials(entry.name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-2xl font-medium text-white truncate">{entry.name}</div>
                  <div className="text-sm text-[#8b8fa3]">{entry.jobTitle ?? ""}</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{formatPoints(entry.points)}</div>
                  <div className="text-xs" style={{ color: entry.level.color }}>
                    {entry.level.icon} {entry.level.name}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function PodiumBig({
  entry,
  position,
}: {
  entry: TvData["ranking"][number];
  position: number;
}) {
  const isFirst = position === 1;
  const config: Record<number, { bg: string; medal: string; height: string; ring: string }> = {
    1: {
      bg: "from-amber-500/30 via-yellow-500/15 to-transparent",
      medal: "🥇",
      height: "h-full",
      ring: "ring-amber-400/60",
    },
    2: {
      bg: "from-slate-400/25 via-slate-500/10 to-transparent",
      medal: "🥈",
      height: "h-[80%] self-end",
      ring: "ring-slate-300/40",
    },
    3: {
      bg: "from-orange-600/25 via-amber-700/10 to-transparent",
      medal: "🥉",
      height: "h-[70%] self-end",
      ring: "ring-orange-500/40",
    },
  };
  const c = config[position];
  return (
    <div
      className={`rounded-2xl bg-gradient-to-b ${c.bg} ring-1 ${c.ring} p-6 flex flex-col items-center text-center justify-center ${c.height}`}
    >
      <div className="text-6xl mb-3">{c.medal}</div>
      {entry.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={entry.avatarUrl}
          alt=""
          className={`h-20 w-20 rounded-full mb-3 object-cover ${isFirst ? "ring-4 ring-amber-400/70" : "ring-2 ring-white/20"}`}
        />
      ) : (
        <div
          className={`h-20 w-20 rounded-full bg-violet-500/20 flex items-center justify-center text-3xl font-bold text-violet-200 mb-3 ${isFirst ? "ring-4 ring-amber-400/70" : "ring-2 ring-white/20"}`}
        >
          {initials(entry.name)}
        </div>
      )}
      <div className={`font-bold text-white truncate w-full ${isFirst ? "text-2xl" : "text-xl"}`}>
        {entry.name}
      </div>
      <div className="text-sm text-[#8b8fa3] mb-3">{entry.jobTitle ?? ""}</div>
      <div className="text-4xl font-bold" style={{ color: entry.level.color }}>
        {formatPoints(entry.points)}
      </div>
      <div className="text-xs text-[#8b8fa3] uppercase tracking-wide mt-1">
        {entry.level.icon} {entry.level.name}
      </div>
      {isFirst && (
        <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-amber-500/25 px-3 py-1 text-xs font-bold text-amber-300">
          <Crown className="h-4 w-4" /> CAMPEÃO DO MÊS
        </div>
      )}
    </div>
  );
}
