import { createClient } from '@/shared/lib/supabase-server'
import { listGoalsAction } from '@/modules/goals/services/goals.actions'
import { listResultsAction } from '@/modules/results/services/results.actions'
import {
  Target,
  TrendingUp,
  Trophy,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  BarChart3,
  ChevronRight,
  CheckCircle2,
  Clock
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

  // Calcular Metas Ativas
  const activeGoalsCount = goals.length

  // Calcular Resultado Geral
  let totalTarget = 0
  let totalAchieved = 0
  goals.forEach((g: any) => {
    totalTarget += Number(g.targetValue)
    const achieved = g.results.reduce((acc: number, r: any) => acc + Number(r.value), 0)
    totalAchieved += achieved
  })
  const generalProgress = totalTarget > 0 ? (totalAchieved / totalTarget) * 100 : 0

  // Calcular Equipe Ativa (usuários distintos que lançaram resultados)
  const activeUsers = new Set(results.map((r: any) => r.userId)).size

  // Top Performers (Agrupado por usuário)
  const userScores: Record<string, { name: string, score: number }> = {}
  results.filter((r: any) => r.status === 'approved').forEach((r: any) => {
    if (!userScores[r.userId]) {
      userScores[r.userId] = { name: r.user.name, score: 0 }
    }
    userScores[r.userId].score += Number(r.value)
  })
  const topPerformers = Object.values(userScores).sort((a, b) => b.score - a.score).slice(0, 5)

  // Top 5 Atividades recentes
  const recentActivities = results.slice(0, 5)

  // Gráfico: últimos 7 dias
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return {
      date: d,
      dateString: d.toISOString().split('T')[0],
      dayName: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'][d.getDay()],
      value: 0
    }
  })

  results.filter((r: any) => r.status === 'approved').forEach((r: any) => {
    const rDate = new Date(r.createdAt).toISOString().split('T')[0]
    const dayData = last7Days.find(d => d.dateString === rDate)
    if (dayData) {
      dayData.value += Number(r.value)
    }
  })

  // Normalize para o gráfico (0 a 100%)
  const maxChartValue = Math.max(...last7Days.map(d => d.value), 1) // evita divisão por zero

  const stats = [
    {
      label: 'Metas Ativas',
      value: activeGoalsCount.toString(),
      change: 'Atualizado',
      trend: 'up',
      icon: Target,
      color: 'var(--orion-indigo)',
      bgColor: 'rgb(99 102 241 / 0.1)',
    },
    {
      label: 'Resultado Geral',
      value: `${generalProgress.toFixed(1)}%`,
      change: 'Progresso total',
      trend: 'up',
      icon: TrendingUp,
      color: 'var(--orion-emerald)',
      bgColor: 'rgb(16 185 129 / 0.1)',
    },
    {
      label: 'Posição no Ranking',
      value: '#--',
      change: 'Em breve',
      trend: 'up',
      icon: Trophy,
      color: 'var(--orion-amber)',
      bgColor: 'rgb(245 158 11 / 0.1)',
    },
    {
      label: 'Equipe Ativa',
      value: activeUsers.toString(),
      change: 'Usuários c/ resultados',
      trend: 'up',
      icon: Users,
      color: 'var(--orion-cyan)',
      bgColor: 'rgb(6 182 212 / 0.1)',
    },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Welcome Banner */}
      <div
        className="rounded-2xl p-6 relative overflow-hidden animate-fade-in-up"
        style={{
          background: 'linear-gradient(135deg, rgb(99 102 241 / 0.2), rgb(168 85 247 / 0.15))',
          border: '1px solid rgb(99 102 241 / 0.2)',
        }}
      >
        <div
          className="orb w-64 h-64 -right-10 -top-10"
          style={{ background: 'rgb(168 85 247 / 0.15)', animationDuration: '10s' }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4" style={{ color: 'rgb(var(--orion-amber))' }} />
            <span className="text-xs font-medium" style={{ color: 'rgb(var(--orion-amber))' }}>
              Bom dia, {new Date().toLocaleDateString('pt-BR', { weekday: 'long' })}!
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Olá, {firstName} 👋
          </h1>
          <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
            Aqui está um resumo do desempenho da sua equipe hoje.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          const isUp = stat.trend === 'up'
          return (
            <div
              key={stat.label}
              className="stat-card animate-fade-in-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: stat.bgColor }}
                >
                  <Icon className="w-5 h-5" style={{ color: `rgb(${stat.color})` }} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Main Grid: Ranking + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Top Performers */}
        <div
          className="lg:col-span-2 rounded-2xl p-6 animate-fade-in-up delay-200"
          style={{ background: 'rgb(var(--glass-bg))', border: '1px solid rgb(var(--glass-border))' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-white text-sm">Ranking da Equipe</h3>
              <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>Julho 2025 — atualizado agora</p>
            </div>
            <button
              className="flex items-center gap-1 text-xs font-medium transition-colors"
              style={{ color: 'rgb(var(--orion-indigo))' }}
            >
              Ver tudo <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {topPerformers.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: 'rgb(var(--text-muted))' }}>Nenhum resultado aprovado ainda.</p>
            ) : topPerformers.map((person, i) => (
              <div key={person.name} className="flex items-center gap-4">
                {/* Position */}
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    background: i === 0 ? 'rgb(245 158 11 / 0.2)' : i === 1 ? 'rgb(156 163 175 / 0.2)' : i === 2 ? 'rgb(180 83 9 / 0.2)' : 'rgb(var(--surface-3))',
                    color: i === 0 ? 'rgb(245 158 11)' : i === 1 ? 'rgb(156 163 175)' : i === 2 ? 'rgb(180 83 9)' : 'rgb(var(--text-muted))',
                  }}
                >
                  {i + 1}
                </div>

                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: `hsl(${i * 60 + 200}, 70%, 45%)` }}
                >
                  {person.name.charAt(0)}
                </div>

                {/* Name + Progress */}
                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <span className="text-sm font-medium text-white truncate">{person.name}</span>
                  <span className="text-xs font-bold ml-2 flex-shrink-0" style={{ color: 'rgb(var(--orion-indigo))' }}>
                    {person.score.toLocaleString('pt-BR')} 
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div
          className="rounded-2xl p-6 animate-fade-in-up delay-300"
          style={{ background: 'rgb(var(--glass-bg))', border: '1px solid rgb(var(--glass-border))' }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white text-sm">Atividade Recente</h3>
            <span className="badge badge-info">Ao vivo</span>
          </div>

          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: 'rgb(var(--text-muted))' }}>Nenhuma atividade ainda.</p>
            ) : recentActivities.map((activity: any) => {
              const isApproved = activity.status === 'approved'
              const Icon = isApproved ? CheckCircle2 : Clock
              
              return (
                <div key={activity.id} className="flex gap-3">
                  <div
                    className="mt-1 flex-shrink-0"
                    style={{
                      color: isApproved ? 'rgb(var(--orion-emerald))' : 'rgb(var(--orion-amber))',
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-white leading-snug">
                      <span className="font-medium">{activity.user.name}</span>{' '}
                      <span style={{ color: 'rgb(var(--text-secondary))' }}>lançou</span>{' '}
                      <span className="font-medium">{Number(activity.value).toLocaleString('pt-BR')} {activity.goal.indicator.unit}</span>{' '}
                      <span style={{ color: 'rgb(var(--text-secondary))' }}>em</span>{' '}
                      <span className="font-medium">{activity.goal.name}</span>
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>
                      {new Date(activity.createdAt).toLocaleDateString('pt-BR')} às {new Date(activity.createdAt).toLocaleTimeString('pt-BR')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div
        className="rounded-2xl p-6 animate-fade-in-up delay-400"
        style={{ background: 'rgb(var(--glass-bg))', border: '1px solid rgb(var(--glass-border))' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-white text-sm">Evolução de Resultados</h3>
            <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>Últimos 7 dias</p>
          </div>
          <div className="flex items-center gap-2">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: range === '7d' ? 'rgb(var(--orion-indigo) / 0.2)' : 'rgb(var(--surface-3))',
                  color: range === '7d' ? 'rgb(var(--orion-indigo))' : 'rgb(var(--text-muted))',
                  border: range === '7d' ? '1px solid rgb(var(--orion-indigo) / 0.3)' : '1px solid transparent',
                }}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Simple visual bar chart */}
        <div className="flex items-end gap-2 h-32">
          {last7Days.map((dayData, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div
                className="w-full rounded-t-md transition-all relative overflow-hidden"
                style={{
                  height: `${(dayData.value / maxChartValue) * 100}%`,
                  background: i === 6 ? 'linear-gradient(180deg, rgb(99 102 241), rgb(168 85 247))' : 'rgb(var(--surface-3))',
                  minHeight: '8px',
                }}
              >
                {dayData.value > 0 && (
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
              <span className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
                {dayData.dayName}
              </span>
              
              {/* Tooltip on hover */}
              {dayData.value > 0 && (
                <div className="absolute -top-8 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                  {dayData.value.toLocaleString('pt-BR')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
