'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import {
  Target,
  TrendingUp,
  Users,
  Clock,
  ArrowUpRight,
  Zap,
  Star,
  ChevronRight,
} from 'lucide-react'

const today = new Date().toLocaleDateString('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

const stats = [
  { label: 'Metas Ativas', value: '3', sub: 'em andamento', icon: Target, color: 'rgb(99 102 241)', bg: 'rgb(99 102 241 / 0.12)', href: '#' },
  { label: 'Resultado Geral', value: '67.4%', sub: 'do total alcançado', icon: TrendingUp, color: 'rgb(16 185 129)', bg: 'rgb(16 185 129 / 0.12)', href: '#' },
  { label: 'Equipe Ativa', value: '12', sub: 'lançaram resultados', icon: Users, color: 'rgb(6 182 212)', bg: 'rgb(6 182 212 / 0.12)', href: '#' },
  { label: 'Aguardando', value: '5', sub: 'itens p/ aprovação', icon: Clock, color: 'rgb(245 158 11)', bg: 'rgb(245 158 11 / 0.12)', href: '#' },
]

const last7Days = [
  { dayName: 'Dom', value: 0 },
  { dayName: 'Seg', value: 28 },
  { dayName: 'Ter', value: 45 },
  { dayName: 'Qua', value: 32 },
  { dayName: 'Qui', value: 68 },
  { dayName: 'Sex', value: 95 },
  { dayName: 'Sáb', value: 80 },
]
const maxChartValue = Math.max(...last7Days.map((d) => d.value), 1)

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'rgb(var(--background))' }}>
      {/* Sidebar retrátil */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{
            background: 'rgb(var(--surface-1) / 0.6)',
            borderColor: 'rgb(var(--glass-border) / 0.2)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Dashboard</h2>
              <p className="text-xs capitalize" style={{ color: 'rgb(var(--text-muted))' }}>
                {today}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
            <kbd
              className="px-2 py-1 rounded-md font-mono text-xs"
              style={{ background: 'rgb(var(--surface-2))', border: '1px solid rgb(var(--glass-border) / 0.3)' }}
            >
              Ctrl+B
            </kbd>
            <span>para recolher/expandir o menu</span>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6 max-w-7xl mx-auto">
            {/* Welcome Banner */}
            <div
              className="rounded-2xl p-6 relative overflow-hidden animate-fade-in-up"
              style={{
                background: 'linear-gradient(135deg, rgb(99 102 241 / 0.25), rgb(168 85 247 / 0.15))',
                border: '1px solid rgb(99 102 241 / 0.25)',
              }}
            >
              <div
                className="orb w-80 h-80 -right-16 -top-16"
                style={{ background: 'rgb(168 85 247 / 0.12)', animationDuration: '12s' }}
              />
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4" style={{ color: 'rgb(var(--orion-amber))' }} />
                    <span
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'rgb(var(--orion-amber))' }}
                    >
                      {today}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-1">Olá, Admin 👋</h1>
                  <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                    Aqui está o desempenho da sua equipe em tempo real.
                  </p>
                </div>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
                  style={{ background: 'rgb(245 158 11 / 0.3)', border: '1px solid rgb(245 158 11 / 0.4)' }}
                >
                  <Clock className="w-4 h-4 text-amber-400" />
                  5 resultados pendentes
                </a>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {stats.map((stat, i) => {
                const Icon = stat.icon
                return (
                  <a
                    key={stat.label}
                    href={stat.href}
                    className="stat-card animate-fade-in-up group block"
                    style={{ animationDelay: `${i * 0.07}s` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: stat.bg }}
                      >
                        <Icon className="w-5 h-5" style={{ color: stat.color }} />
                      </div>
                      <ArrowUpRight
                        className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: stat.color }}
                      />
                    </div>
                    <p className="text-3xl font-bold text-white mb-0.5">{stat.value}</p>
                    <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
                      {stat.sub}
                    </p>
                    <p className="text-sm font-medium mt-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                      {stat.label}
                    </p>
                  </a>
                )
              })}
            </div>

            {/* Evolution Chart */}
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
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ background: 'linear-gradient(180deg, rgb(99 102 241), rgb(168 85 247))' }}
                  />
                  <span>Aprovados</span>
                </div>
              </div>

              <div className="flex items-end gap-3 h-36 px-2">
                {last7Days.map((dayData, i) => {
                  const barPct = (dayData.value / maxChartValue) * 100
                  const isToday = i === 6
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-1.5 group relative"
                    >
                      {dayData.value > 0 && (
                        <div
                          className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-950 text-white text-xs py-0.5 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-lg border border-white/10"
                        >
                          {dayData.value.toLocaleString('pt-BR')}
                        </div>
                      )}
                      <div className="w-full flex-1 flex items-end">
                        <div
                          className="w-full rounded-t-lg transition-all relative overflow-hidden cursor-pointer"
                          style={{
                            height: mounted ? `${barPct}%` : '0%',
                            minHeight: '6px',
                            transition: 'height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            transitionDelay: `${i * 0.08}s`,
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
                      <span
                        className={`text-xs font-medium ${isToday ? 'text-indigo-400' : ''}`}
                        style={{ color: isToday ? '' : 'rgb(var(--text-muted))' }}
                      >
                        {dayData.dayName}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Hint */}
            <div
              className="rounded-2xl p-5 flex items-start gap-3 animate-fade-in-up"
              style={{
                background: 'rgb(16 185 129 / 0.08)',
                border: '1px solid rgb(16 185 129 / 0.25)',
              }}
            >
              <Star className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'rgb(110 231 183)' }} />
              <div>
                <p className="text-sm font-semibold text-white mb-1">
                  Demonstração de sidebar retrátil com animação
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'rgb(var(--text-secondary))' }}>
                  Clique no botão circular (<ChevronRight className="inline w-3 h-3" />) na borda direita
                  da sidebar para recolhê-la. A largura é animada com{' '}
                  <code className="font-mono px-1 rounded" style={{ background: 'rgb(var(--surface-3))' }}>
                    cubic-bezier
                  </code>
                  , os labels fazem fade + slide, e o ícone gira 180°. Quando recolhida, hover em qualquer
                  item mostra um tooltip com o nome. Estado é persistido em{' '}
                  <code className="font-mono px-1 rounded" style={{ background: 'rgb(var(--surface-3))' }}>
                    localStorage
                  </code>{' '}
                  e há atalho <kbd className="font-mono px-1.5 py-0.5 rounded text-xs" style={{ background: 'rgb(var(--surface-3))', border: '1px solid rgb(var(--glass-border))' }}>Ctrl+B</kbd>.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
