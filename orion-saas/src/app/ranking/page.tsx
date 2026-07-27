import Link from "next/link";
import {
  Trophy,
  Crown,
  TrendingUp,
  Star,
  Users,
  AlertCircle,
} from "lucide-react";
import DashboardLayout from "../dashboard/layout";
import { PageHeader, Badge } from "@/components/ui-parts";
import { getRankingAction, type RankingEntry } from "@/lib/actions";

export const dynamic = "force-dynamic";

const PERIOD_LABELS = {
  week: "Esta semana",
  month: "Este mês",
  quarter: "Este trimestre",
  all: "Geral",
} as const;

type Period = keyof typeof PERIOD_LABELS;

const MEDAL_STYLES = [
  {
    bg: "linear-gradient(135deg, #f59e0b, #fbbf24)",
    ring: "ring-amber-400/40",
    label: "🥇",
  },
  {
    bg: "linear-gradient(135deg, #9ca3af, #d1d5db)",
    ring: "ring-gray-400/40",
    label: "🥈",
  },
  {
    bg: "linear-gradient(135deg, #cd7c3c, #e8a87c)",
    ring: "ring-orange-400/40",
    label: "🥉",
  },
];

function PodiumCard({
  entry,
  style,
  isFirst,
}: {
  entry: RankingEntry;
  style: (typeof MEDAL_STYLES)[number];
  isFirst: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-3 p-6 rounded-2xl glass-card glass-card-hover ${
        isFirst ? "scale-105" : ""
      }`}
    >
      {isFirst && <Crown className="h-6 w-6 text-amber-400 animate-pulse" />}

      <div
        className={`relative w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-xl ring-4 ${style.ring}`}
        style={{ background: style.bg }}
      >
        {(entry.name.charAt(0) || "U").toUpperCase()}
        <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-sm border-2 border-[#0f111a] bg-white/10">
          {style.label}
        </div>
      </div>

      <div className="text-center">
        <p className="font-bold text-white text-sm">
          {entry.name.split(" ")[0]}
        </p>
        <p className="text-xs mt-0.5 text-[#6b7280]">
          {entry.jobTitle ?? "Vendedor"}
        </p>
      </div>

      <div className="px-4 py-1.5 rounded-full text-sm font-bold bg-violet-500/15 text-violet-300">
        {entry.totalValue.toLocaleString("pt-BR")}
      </div>

      <div className="grid grid-cols-2 gap-2 w-full mt-1">
        <div className="text-center">
          <p className="text-xs font-semibold text-white">
            {entry.approvedCount}
          </p>
          <p className="text-[10px] text-[#6b7280]">lançamentos</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold text-white">
            {entry.avgProgress}%
          </p>
          <p className="text-[10px] text-[#6b7280]">progresso</p>
        </div>
      </div>
    </div>
  );
}

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const period = (params.period ?? "month") as Period;
  const { data: ranking, error } = await getRankingAction(period);

  const podium = ranking?.slice(0, 3) ?? [];
  const rest = ranking?.slice(3) ?? [];
  const totalParticipants = ranking?.length ?? 0;
  const totalValue =
    ranking?.reduce((acc, r) => acc + r.totalValue, 0) ?? 0;
  const avgProgress =
    ranking && ranking.length > 0
      ? Math.round(
          ranking.reduce((acc, r) => acc + r.avgProgress, 0) / ranking.length,
        )
      : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <PageHeader
          title="Ranking da Equipe"
          description="Classificação baseada em resultados aprovados."
          icon={Trophy}
          action={
            <div
              className="flex items-center gap-1 p-1 rounded-xl"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
                <Link
                  key={p}
                  href={`/ranking?period=${p}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    period === p
                      ? "bg-violet-500/15 text-violet-300 border border-violet-500/30"
                      : "text-[#8b8fa3] hover:text-white border border-transparent"
                  }`}
                >
                  {PERIOD_LABELS[p]}
                </Link>
              ))}
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
            href="/aprovacoes"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 h-9 text-xs font-medium text-[#8b8fa3] hover:text-white hover:bg-white/10 transition-colors"
          >
            Aprovações
          </Link>
        </div>

        {error && (
          <div className="glass-card p-4 flex items-center gap-3 border-red-500/30">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Stats */}
        {ranking && ranking.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="glass-card glass-card-hover p-5">
              <p className="text-sm text-[#8b8fa3]">Participantes</p>
              <p className="text-2xl font-bold text-white mt-1">
                {totalParticipants}
              </p>
              <p className="text-xs text-emerald-400 mt-1.5">com resultados</p>
            </div>
            <div className="glass-card glass-card-hover p-5">
              <p className="text-sm text-[#8b8fa3]">Total acumulado</p>
              <p className="text-2xl font-bold text-violet-300 mt-1">
                {totalValue.toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-[#8b8fa3] mt-1.5">aprovados</p>
            </div>
            <div className="glass-card glass-card-hover p-5">
              <p className="text-sm text-[#8b8fa3]">Progresso médio</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {avgProgress}%
              </p>
              <p className="text-xs text-[#8b8fa3] mt-1.5">das metas</p>
            </div>
          </div>
        )}

        {(!ranking || ranking.length === 0) && !error && (
          <div className="glass-card p-16 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-amber-400 opacity-40" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Nenhum resultado aprovado ainda
            </h3>
            <p className="text-sm text-[#8b8fa3]">
              Assim que resultados forem aprovados pelo gestor, o ranking será
              atualizado automaticamente.
            </p>
          </div>
        )}

        {ranking && ranking.length > 0 && (
          <>
            {/* Pódio Top 3 */}
            {podium.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2 text-[#6b7280]">
                  <Star className="h-4 w-4 text-amber-400" /> Pódio — Top 3
                </h2>
                <div
                  className={`grid gap-4 ${
                    podium.length === 1
                      ? "grid-cols-1 max-w-xs mx-auto"
                      : podium.length === 2
                        ? "grid-cols-2 max-w-md mx-auto"
                        : "grid-cols-3"
                  }`}
                >
                  {podium.length === 3 ? (
                    [1, 0, 2].map((idx) => (
                      <PodiumCard
                        key={podium[idx].userId}
                        entry={podium[idx]}
                        style={MEDAL_STYLES[idx]}
                        isFirst={idx === 0}
                      />
                    ))
                  ) : (
                    podium.map((entry, idx) => (
                      <PodiumCard
                        key={entry.userId}
                        entry={entry}
                        style={MEDAL_STYLES[idx]}
                        isFirst={idx === 0}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tabela completa */}
            {rest.length > 0 && (
              <div className="glass-card overflow-hidden">
                <div className="p-5 flex items-center gap-2 border-b border-white/[0.06]">
                  <Users className="h-4 w-4 text-violet-300" />
                  <h2 className="font-semibold text-white text-sm">
                    Classificação Completa
                  </h2>
                </div>
                <div className="divide-y divide-white/[0.06]">
                  {rest.map((entry) => (
                    <div
                      key={entry.userId}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors"
                    >
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 bg-white/5 text-[#8b8fa3]">
                        {entry.position}
                      </span>

                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                        style={{
                          background: `hsl(${
                            (entry.position * 47) % 360
                          }, 60%, 45%)`,
                        }}
                      >
                        {(entry.name.charAt(0) || "U").toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {entry.name}
                        </p>
                        <p className="text-xs truncate text-[#6b7280]">
                          {entry.approvedCount} lançamentos •{" "}
                          {entry.avgProgress}% de progresso
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-bold text-violet-300">
                          {entry.totalValue.toLocaleString("pt-BR")}
                        </p>
                        <div className="flex items-center gap-1 justify-end">
                          <TrendingUp className="h-3 w-3 text-emerald-400" />
                          <p className="text-xs text-emerald-400">total</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rest.length === 0 && podium.length >= 1 && (
              <div className="glass-card p-4 text-center text-sm text-[#8b8fa3]">
                Mostrando todos os {ranking.length} participante
                {ranking.length !== 1 ? "s" : ""} com resultados aprovados.
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
