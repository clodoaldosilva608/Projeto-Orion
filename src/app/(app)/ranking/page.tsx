import { getRankingAction, type RankingEntry } from '@/modules/results/services/ranking.actions'
import { Trophy, Medal, Crown, TrendingUp, Target, Star, Users } from 'lucide-react'

export const metadata = { title: 'Orion — Ranking' }

const PERIOD_LABELS = {
  week: 'Esta semana',
  month: 'Este mês',
  quarter: 'Este trimestre',
  all: 'Geral',
} as const

type Period = keyof typeof PERIOD_LABELS

const MEDAL_STYLES = [
  { bg: 'linear-gradient(135deg, #f59e0b, #fbbf24)', shadow: 'shadow-amber-500/30', label: '🥇', ring: 'ring-amber-400/40' },
  { bg: 'linear-gradient(135deg, #9ca3af, #d1d5db)', shadow: 'shadow-gray-400/30', label: '🥈', ring: 'ring-gray-400/40' },
  { bg: 'linear-gradient(135deg, #cd7c3c, #e8a87c)', shadow: 'shadow-orange-600/30', label: '🥉', ring: 'ring-orange-400/40' },
]

function PodiumCard({ entry, style, isFirst }: { entry: RankingEntry; style: typeof MEDAL_STYLES[0]; isFirst: boolean }) {
  return (
    <div
      className={`flex flex-col items-center gap-3 p-6 rounded-2xl transition-all animate-fade-in-up ${isFirst ? 'scale-105' : ''}`}
      style={{ background: 'rgb(var(--glass-bg))', border: '1px solid rgb(var(--glass-border))' }}
    >
      {/* Crown for 1st */}
      {isFirst && (
        <Crown className="w-6 h-6 text-amber-400 animate-pulse" />
      )}

      {/* Avatar */}
      <div
        className={`relative w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-xl ring-4 ${style.ring}`}
        style={{ background: style.bg }}
      >
        {entry.name.charAt(0).toUpperCase()}
        <div
          className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-sm border-2"
          style={{ background: 'rgb(var(--surface-1))', borderColor: 'rgb(var(--glass-border))' }}
        >
          {style.label}
        </div>
      </div>

      {/* Info */}
      <div className="text-center">
        <p className="font-bold text-white text-sm">{entry.name.split(' ')[0]}</p>
        <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>
          {entry.jobTitle ?? 'Vendedor'}
        </p>
      </div>

      {/* Score */}
      <div
        className="px-4 py-1.5 rounded-full text-sm font-bold"
        style={{ background: 'rgb(var(--surface-2))', color: 'rgb(var(--orion-indigo))' }}
      >
        {entry.totalValue.toLocaleString('pt-BR')}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 w-full mt-1">
        <div className="text-center">
          <p className="text-xs font-semibold text-white">{entry.approvedCount}</p>
          <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>lançamentos</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold text-white">{entry.avgProgress}%</p>
          <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>progresso</p>
        </div>
      </div>
    </div>
  )
}

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const params = await searchParams
  const period = (params.period ?? 'month') as Period
  const { data: ranking, error } = await getRankingAction(period)

  const podium = ranking?.slice(0, 3) ?? []
  const rest = ranking?.slice(3) ?? []

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            Ranking da Equipe
          </h1>
          <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
            Classificação baseada em resultados aprovados
          </p>
        </div>

        {/* Period Tabs */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl"
          style={{ background: 'rgb(var(--surface-1))' }}
        >
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <a
              key={p}
              href={`/ranking?period=${p}`}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: period === p ? 'rgb(var(--orion-indigo) / 0.2)' : 'transparent',
                color: period === p ? 'rgb(var(--orion-indigo))' : 'rgb(var(--text-muted))',
                border: period === p ? '1px solid rgb(var(--orion-indigo) / 0.3)' : '1px solid transparent',
              }}
            >
              {PERIOD_LABELS[p]}
            </a>
          ))}
        </div>
      </div>

      {error && (
        <div
          className="rounded-xl p-4 text-sm text-rose-400"
          style={{ background: 'rgb(244 63 94 / 0.1)', border: '1px solid rgb(244 63 94 / 0.2)' }}
        >
          {error}
        </div>
      )}

      {(!ranking || ranking.length === 0) ? (
        <div className="glass-card p-16 text-center animate-fade-in-up">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-amber-400 opacity-40" />
          <h3 className="text-lg font-semibold text-white mb-2">Nenhum resultado aprovado ainda</h3>
          <p className="text-sm" style={{ color: 'rgb(var(--text-muted))' }}>
            Assim que resultados forem aprovados pelo gestor, o ranking será atualizado automaticamente.
          </p>
        </div>
      ) : (
        <>
          {/* Pódio Top 3 */}
          {podium.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'rgb(var(--text-muted))' }}>
                <Star className="w-4 h-4 text-amber-400" /> Pódio — Top 3
              </h2>
              <div className={`grid gap-4 ${podium.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' : podium.length === 2 ? 'grid-cols-2 max-w-md mx-auto' : 'grid-cols-3'}`}>
                {podium.length === 3 ? (
                  // Ordem visual: 2º | 1º | 3º
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
              <div className="p-5 flex items-center gap-2" style={{ borderBottom: '1px solid rgb(var(--glass-border))' }}>
                <Users className="w-4 h-4" style={{ color: 'rgb(var(--orion-indigo))' }} />
                <h2 className="font-semibold text-white text-sm">Classificação Completa</h2>
              </div>
              <div className="divide-y" style={{ borderColor: 'rgb(var(--glass-border))' }}>
                {rest.map((entry) => (
                  <div
                    key={entry.userId}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors"
                  >
                    {/* Posição */}
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: 'rgb(var(--surface-2))', color: 'rgb(var(--text-muted))' }}
                    >
                      {entry.position}
                    </span>

                    {/* Avatar */}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: `hsl(${(entry.position * 47) % 360}, 60%, 45%)` }}
                    >
                      {entry.name.charAt(0)}
                    </div>

                    {/* Nome */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{entry.name}</p>
                      <p className="text-xs truncate" style={{ color: 'rgb(var(--text-muted))' }}>
                        {entry.approvedCount} lançamentos • {entry.avgProgress}% de progresso
                      </p>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <p className="text-sm font-bold" style={{ color: 'rgb(var(--orion-indigo))' }}>
                        {entry.totalValue.toLocaleString('pt-BR')}
                      </p>
                      <div className="flex items-center gap-1 justify-end">
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                        <p className="text-xs text-emerald-400">total</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Todos no pódio (menos de 4) */}
          {rest.length === 0 && podium.length >= 1 && (
            <div
              className="rounded-xl p-4 text-center text-sm"
              style={{ background: 'rgb(var(--surface-1))', color: 'rgb(var(--text-muted))' }}
            >
              Mostrando todos os {ranking.length} participante{ranking.length !== 1 ? 's' : ''} com resultados aprovados.
            </div>
          )}
        </>
      )}
    </div>
  )
}
