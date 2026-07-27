"use client";

import { useEffect, useState } from "react";
import { Trophy, Users, Award, Calendar, Sparkles } from "lucide-react";

type TvData = {
  company: { id: string; name: string };
  now: string;
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
  kpis: {
    goals: number;
    activeUsers: number;
    approvedResultsThisMonth: number;
  };
};

function formatPoints(n: number): string {
  return n.toLocaleString("pt-BR");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export function TvCampanhas({ data: initialData }: { data: TvData }) {
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
  const campaigns = data.activeCampaigns;

  // Color cycle for campaigns
  const colors = ["#8b5cf6", "#10b981", "#f59e0b", "#3b82f6", "#ef4444"];

  return (
    <div className="h-full flex flex-col gap-6 p-8 overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Trophy className="h-9 w-9 text-amber-300" />
            Campanhas Ativas
          </h1>
          <p className="text-lg text-[#8b8fa3] mt-1">
            {data.company.name} · {campaigns.length} campanha(s) em andamento
          </p>
        </div>
        <div className="text-right text-sm text-[#6b7280]">
          <div>Próxima atualização em {secondsLeft}s</div>
        </div>
      </div>

      {/* Stats */}
      <div className="shrink-0 grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.06] p-4">
          <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Campanhas ativas</div>
          <div className="text-4xl font-bold text-violet-300">{campaigns.length}</div>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
          <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Prêmios totais</div>
          <div className="text-4xl font-bold text-amber-300">
            {campaigns.reduce((acc, c) => acc + c.awardsCount, 0)}
          </div>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
          <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Participantes</div>
          <div className="text-4xl font-bold text-emerald-300">
            {campaigns.reduce((acc, c) => acc + c.participantsCount, 0)}
          </div>
        </div>
        <div className="rounded-xl border border-sky-500/20 bg-sky-500/[0.06] p-4">
          <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Vendedores ativos</div>
          <div className="text-4xl font-bold text-sky-300">{data.kpis.activeUsers}</div>
        </div>
      </div>

      {/* Campaign cards */}
      <div className="flex-1 overflow-hidden">
        {campaigns.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[#8b8fa3] text-2xl">
            <Trophy className="h-16 w-16 mr-4 opacity-30" />
            Nenhuma campanha ativa no momento
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 h-full">
            {campaigns.map((c, idx) => {
              const color = colors[idx % colors.length];
              const isEndingSoon = c.daysLeft <= 3;
              return (
                <div
                  key={c.id}
                  className="rounded-2xl border p-6 flex flex-col gap-3"
                  style={{
                    backgroundColor: `${color}11`,
                    borderColor: `${color}33`,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl shrink-0"
                        style={{ backgroundColor: `${color}22`, border: `2px solid ${color}44` }}
                      >
                        🏆
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-2xl font-bold text-white truncate">{c.name}</h3>
                        <p className="text-sm text-[#8b8fa3] line-clamp-1">
                          {c.description ?? "Sem descrição"}
                        </p>
                      </div>
                    </div>
                    {isEndingSoon && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-red-500/20 px-2 py-1 text-xs font-bold text-red-300 animate-pulse shrink-0">
                        ENCERRA EM BREVE
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-6 mt-auto pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5" style={{ color }} />
                      <span className="text-lg font-semibold text-white">{c.participantsCount}</span>
                      <span className="text-sm text-[#8b8fa3]">participantes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5" style={{ color }} />
                      <span className="text-lg font-semibold text-white">{c.awardsCount}</span>
                      <span className="text-sm text-[#8b8fa3]">prêmios</span>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                      <Calendar className="h-5 w-5" style={{ color }} />
                      <span className="text-sm text-[#8b8fa3]">Termina em</span>
                      <span
                        className="text-2xl font-bold"
                        style={{ color: isEndingSoon ? "#f87171" : color }}
                      >
                        {c.daysLeft === 0 ? "HOJE!" : `${c.daysLeft}d`}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar (visual only — daysLeft / 30 as proxy) */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8b8fa3] mb-1">
                      <span>Progresso da campanha</span>
                      <span>{formatDate(c.endDate)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.max(10, Math.min(100, 100 - (c.daysLeft / 30) * 100))}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming endings ticker */}
      {data.upcomingEndings.length > 0 && (
        <div className="shrink-0 flex items-center gap-3 text-sm text-[#8b8fa3]">
          <Sparkles className="h-4 w-4 text-amber-300" />
          <span>Encerramentos próximos:</span>
          {data.upcomingEndings.map((c) => (
            <span key={c.id} className="text-white">
              <strong>{c.name}</strong> · {c.daysLeft === 0 ? "hoje" : `${c.daysLeft}d`}
            </span>
          )).reduce((acc: any[], el, idx) => {
            if (idx > 0) acc.push(<span key={`sep-${idx}`} className="text-[#6b7280]">·</span>);
            acc.push(el);
            return acc;
          }, [])}
        </div>
      )}
    </div>
  );
}
