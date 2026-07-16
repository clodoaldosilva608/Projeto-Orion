import { listGoalsAction } from '@/modules/goals/services/goals.actions'
import { listResultsAction } from '@/modules/results/services/results.actions'
import { createClient } from '@/shared/lib/supabase-server'
import Link from 'next/link'
import {
  Target,
  TrendingUp,
  Trophy,
  Users,
  ArrowUpRight,
  Zap,
  CheckCircle2,
  Clock,
  ChevronRight,
  Star,
  Medal,
  Flame,
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const firstName = user?.user_metadata?.name?.split(' ')[0] ?? 'Usuário'

  const [goalsRes, resultsRes] = await Promise.all([
    listGoalsAction(),
    listResultsAction()
  ])

  const goals = goalsRes.data || []
  const results = resultsRes.data || []

  // ─── KPI Stats ──────────────────────────────────────────────────────────────
  const activeGoalsCount = goals.length

  let totalTarget = 0
  let totalAchieved = 0
  goals.forEach((g: any) => {
    totalTarget += Number(g.targetValue)
    const achieved = g.results.reduce((acc: number, r: any) => acc + Number(r.value), 0)
    totalAchieved += achieved
  })
  const generalProgress = totalTarget > 0 ? Math.min(100, (totalAchieved / totalTarget) * 100) : 0

  const activeUsers = new Set(results.map((r: any) => r.userId)).size

  const pendingCount = results.filter((r: any) => r.status === 'pending').length

  // ─── Top Performers ──────────────────────────────────────────────────────────
  const userScores: Record<string, { name: string; score: number; count: number }> = {}
  results.filter((r: any) => r.status === 'approved').forEach((r: any) => {
    if (!userScores[r.userId]) {
      userScores[r.userId] = { name: r.user.name, score: 0, count: 0 }
    }
    userScores[r.userId].score += Number(r.value)
    userScores[r.userId].count += 1
  })
  const topPerformers = Object.values(userScores).sort((a, b) => b.score - a.score).slice(0, 5)

  // ─── Recent Activity ─────────────────────────────────────────────────────────
  const recentActivities = results.slice(0, 6)

  // ─── Goals progress for widget ───────────────────────────────────────────────
  const goalsWithProgress = goals.slice(0, 4).map((g: any) => {
    const achieved = g.results.reduce((acc: number, r: any) => acc + Number(r.value), 0)
    const target = Number(g.targetValue)
    const pct = target > 0 ? Math.min(100, Math.round((achieved / target) * 100)) : 0
    return { ...g, achieved, pct }
  })

  // ─── Chart: last 7 days ──────────────────────────────────────────────────────
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return {
      dateString: d.toISOString().split('T')[0],
      dayName: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][d.getDay()],
      value: 0,
    }
  })
  results.filter((r: any) => r.status === 'approved').forEach((r: any) => {
    const rDate = new Date(r.createdAt).toISOString().split('T')[0]
    const slot = last7Days.find(d => d.dateString === rDate)
    if (slot) slot.value += Number(r.value)
  })
  const maxChartValue = Math.max(...last7Days.map(d => d.value), 1)

  // ─── Podium ──────────────────────────────────────────────────────────────────
  const podium = topPerformers.slice(0, 3)
  const podiumOrder = [1, 0, 2] // 2nd, 1st, 3rd

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Welcome Banner ─────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-6 relative overflow-hidden animate-fade-in-up"
        style={{
          background: 'linear-gradient(135deg, rgb(99 102 241 / 0.25), rgb(168 85 247 / 0.15))',
          border: '1px solid rgb(99 102 241 / 0.25)',
        }}
      >
        <div className="orb w-80 h-80 -right-16 -top-16" style={{ background: 'rgb(168 85 247 / 0.12)', animationDuration: '12s' }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4" style={{ color: 'rgb(var(--orion-amber))' }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--orion-amber))' }}>
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Olá, {firstName} 👋</h1>
            <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
              Aqui está o desempenho da sua equipe em tempo real.
            </p>
          </div>
          {pendingCount > 0 && (
            <Link
              href="/resultados"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
              style={{ background: 'rgb(245 158 11 / 0.3)', border: '1px solid rgb(245 158 11 / 0.4)' }}
            >
              <Clock className="w-4 h-4 text-amber-400" />
              {pendingCount} resultado{pendingCount > 1 ? 's' : ''} pendente{pendingCount > 1 ? 's' : ''}
            </Link>
          )}
        </div>
      </div>

      {/* ── Stats Grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Metas Ativas', value: activeGoalsCount.toString(), sub: 'em andamento', icon: Target, color: 'rgb(99 102 241)', bg: 'rgb(99 102 241 / 0.12)', href: '/metas' },
          { label: 'Resultado Geral', value: `${generalProgress.toFixed(1)}%`, sub: 'do total alcançado', icon: TrendingUp, color: 'rgb(16 185 129)', bg: 'rgb(16 185 129 / 0.12)', href: '/metas' },
          { label: 'Equipe Ativa', value: activeUsers.toString(), sub: 'lançaram resultados', icon: Users, color: 'rgb(6 182 212)', bg: 'rgb(6 182 212 / 0.12)', href: '/equipe' },
          { label: 'Aguardando', value: pendingCount.toString(), sub: 'itens p/ aprovação', icon: Clock, color: 'rgb(245 158 11)', bg: 'rgb(245 158 11 / 0.12)', href: '/resultados' },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="stat-card animate-fade-in-up group block hover:scale-[1.02] transition-all"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: stat.bg }}>
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: stat.color }} />
              </div>
              <p className="text-3xl font-bold text-white mb-0.5">{stat.value}</p>
              <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>{stat.sub}</p>
              <p className="text-sm font-medium mt-1" style={{ color: 'rgb(var(--text-secondary))' }}>{stat.label}</p>
            </Link>
          )
        })}
      </div>

      {/* ── Main Grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Podium / Ranking ───────────────────────────────────────────── */}
        <div
          className="lg:col-span-2 rounded-2xl p-6 animate-fade-in-up"
          style={{ background: 'rgb(var(--glass-bg))', border: '1px solid rgb(var(--glass-border))' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" /> Top Performers
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>Baseado em resultados aprovados</p>
            </div>
            <Link href="/ranking" className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80" style={{ color: 'rgb(var(--orion-indigo))' }}>
              Ver ranking <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {topPerformers.length === 0 ? (
            <div className="text-center py-10">
              <Star className="w-10 h-10 mx-auto mb-3 opacity-30 text-amber-400" />
              <p className="text-sm" style={{ color: 'rgb(var(--text-muted))' }}>Nenhum resultado aprovado ainda.</p>
            </div>
          ) : (
            <>
              {/* Pódio Top 3 */}
              {podium.length >= 2 && (
                <div className="flex items-end justify-center gap-3 mb-6 pt-2">
                  {podiumOrder.map((idx) => {
                    if (!podium[idx]) return null
                    const person = podium[idx]
                    const pos = idx + 1
                    const heights = ['h-20', 'h-28', 'h-14']
                    const colors = [
                      { bg: 'rgb(192 132 252 / 0.2)', border: 'rgb(192 132 252 / 0.5)', text: 'rgb(192 132 252)', medal: '🥈' },
                      { bg: 'rgb(250 204 21 / 0.2)', border: 'rgb(250 204 21 / 0.5)', text: 'rgb(250 204 21)', medal: '🥇' },
                      { bg: 'rgb(251 146 60 / 0.2)', border: 'rgb(251 146 60 / 0.5)', text: 'rgb(251 146 60)', medal: '🥉' },
                    ]
                    const style = colors[idx] || colors[2]
                    return (
                      <div key={person.name} className="flex flex-col items-center gap-1 flex-1 max-w-[120px]">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white mb-1" style={{ background: `hsl(${idx * 90 + 200}, 70%, 45%)` }}>
                          {person.name.charAt(0)}
                        </div>
                        <p className="text-xs font-medium text-white text-center truncate w-full">{person.name.split(' ')[0]}</p>
                        <p className="text-xs font-bold" style={{ color: style.text }}>
                          {person.score.toLocaleString('pt-BR')}
                        </p>
                        <div
                          className={`w-full ${heights[idx]} rounded-t-xl flex items-center justify-center text-xl`}
                          style={{ background: style.bg, border: `1px solid ${style.border}` }}
                        >
                          {style.medal}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Lista 4º e 5º */}
              {topPerformers.slice(3).map((person, i) => (
                <div key={person.name} className="flex items-center gap-3 py-2 border-t" style={{ borderColor: 'rgb(var(--glass-border))' }}>
                  <span className="text-xs font-bold w-5 text-center" style={{ color: 'rgb(var(--text-muted))' }}>{i + 4}º</span>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: `hsl(${(i + 3) * 60 + 200}, 60%, 45%)` }}>
                    {person.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-white flex-1">{person.name}</span>
                  <span className="text-xs font-bold" style={{ color: 'rgb(var(--text-secondary))' }}>{person.score.toLocaleString('pt-BR')}</span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* ── Atividade Recente ──────────────────────────────────────────── */}
        <div className="rounded-2xl p-6 animate-fade-in-up" style={{ background: 'rgb(var(--glass-bg))', border: '1px solid rgb(var(--glass-border))' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" /> Atividade
            </h3>
            <span className="badge badge-info text-xs">Ao vivo</span>
          </div>
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: 'rgb(var(--text-muted))' }}>Nenhuma atividade ainda.</p>
            ) : recentActivities.map((activity: any) => {
              const isApproved = activity.status === 'approved'
              const Icon = isApproved ? CheckCircle2 : Clock
              return (
                <div key={activity.id} className="flex gap-2.5">
                  <div className="mt-0.5 flex-shrink-0" style={{ color: isApproved ? 'rgb(var(--orion-emerald))' : 'rgb(var(--orion-amber))' }}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-white leading-snug">
                      <span className="font-semibold">{activity.user.name.split(' ')[0]}</span>{' '}
                      <span style={{ color: 'rgb(var(--text-secondary))' }}>lançou</span>{' '}
                      <span className="font-semibold">{Number(activity.value).toLocaleString('pt-BR')}</span>{' '}
                      <span style={{ color: 'rgb(var(--text-muted))' }}>em {activity.goal.name}</span>
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>
                      {new Date(activity.createdAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} às {new Date(activity.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Goals Progress Widgets ─────────────────────────────────────────── */}
      {goalsWithProgress.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" /> Progresso das Metas
            </h3>
            <Link href="/metas" className="text-xs font-medium hover:opacity-80" style={{ color: 'rgb(var(--orion-indigo))' }}>
              Ver todas
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {goalsWithProgress.map((goal: any, i: number) => {
              const pct = goal.pct
              const gradients = [
                'linear-gradient(90deg, rgb(99 102 241), rgb(168 85 247))',
                'linear-gradient(90deg, rgb(16 185 129), rgb(6 182 212))',
                'linear-gradient(90deg, rgb(245 158 11), rgb(251 146 60))',
                'linear-gradient(90deg, rgb(239 68 68), rgb(236 72 153))',
              ]
              return (
                <div key={goal.id} className="rounded-2xl p-4 animate-fade-in-up" style={{ background: 'rgb(var(--glass-bg))', border: '1px solid rgb(var(--glass-border))', animationDelay: `${i * 0.08}s` }}>
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-sm font-medium text-white line-clamp-2 flex-1 leading-snug">{goal.name}</p>
                    <span
                      className="text-xs font-bold ml-2 flex-shrink-0"
                      style={{ color: pct >= 100 ? 'rgb(16 185 129)' : pct >= 70 ? 'rgb(245 158 11)' : 'rgb(var(--orion-indigo))' }}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div className="mb-3">
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgb(var(--surface-3))' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: gradients[i % gradients.length] }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
                    <span>{goal.achieved.toLocaleString('pt-BR')} alcançado</span>
                    <span>de {Number(goal.targetValue).toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="mt-2 text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
                    {goal.indicator?.unit}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Evolution Chart ────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-6 animate-fade-in-up"
        style={{ background: 'rgb(var(--glass-bg))', border: '1px solid rgb(var(--glass-border))' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-white text-sm">Evolução de Resultados</h3>
            <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>
              Últimos 7 dias · resultados aprovados
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
            <div className="w-3 h-3 rounded-sm" style={{ background: 'linear-gradient(180deg, rgb(99 102 241), rgb(168 85 247))' }} />
            <span>Aprovados</span>
          </div>
        </div>

        {/* Bar chart com labels */}
        <div className="flex items-end gap-3 h-36 px-2">
          {last7Days.map((dayData, i) => {
            const barPct = (dayData.value / maxChartValue) * 100
            const isToday = i === 6
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                {/* Tooltip */}
                {dayData.value > 0 && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-950 text-white text-xs py-0.5 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-lg border border-white/10">
                    {dayData.value.toLocaleString('pt-BR')}
                  </div>
                )}
                {/* Bar */}
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full rounded-t-lg transition-all relative overflow-hidden cursor-pointer"
                    style={{
                      height: `${barPct}%`,
                      minHeight: '6px',
                      background: isToday
                        ? 'linear-gradient(180deg, rgb(99 102 241), rgb(168 85 247))'
                        : dayData.value > 0
                        ? 'linear-gradient(180deg, rgb(99 102 241 / 0.5), rgb(168 85 247 / 0.3))'
                        : 'rgb(var(--surface-3))',
                    }}
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg" />
                  </div>
                </div>
                {/* Day label */}
                <span className={`text-xs font-medium ${isToday ? 'text-indigo-400' : ''}`} style={{ color: isToday ? '' : 'rgb(var(--text-muted))' }}>
                  {dayData.dayName}
                </span>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
