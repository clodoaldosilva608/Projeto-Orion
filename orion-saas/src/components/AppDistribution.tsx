import { Globe, Smartphone, Radio, Monitor } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface AppType {
  label: string
  count: number
  percent: number
  icon: LucideIcon
  color: string
  bg: string
}

const APP_TYPES: AppType[] = [
  { label: 'Web Apps', count: 142, percent: 51, icon: Globe, color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.12)' },
  { label: 'Mobile Apps', count: 96, percent: 35, icon: Smartphone, color: '#a78bfa', bg: 'rgba(139, 92, 246, 0.12)' },
  { label: 'PWA', count: 28, percent: 10, icon: Radio, color: '#c4b5fd', bg: 'rgba(196, 181, 253, 0.12)' },
  { label: 'Desktop Apps', count: 12, percent: 4, icon: Monitor, color: '#f472b6', bg: 'rgba(236, 72, 153, 0.12)' },
]

export function AppDistribution() {
  const total = APP_TYPES.reduce((acc, t) => acc + t.count, 0)

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-white mb-1">Distribuição de Aplicações</h3>
      <p className="text-tiny mb-4" style={{ color: 'var(--text-muted)' }}>
        {total} aplicações publicadas no total
      </p>

      <div className="grid grid-cols-2 gap-3">
        {APP_TYPES.map((t) => {
          const Icon = t.icon
          return (
            <div
              key={t.label}
              className="p-3 rounded-lg transition-colors hover:bg-white/3"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-2"
                style={{ background: t.bg }}
              >
                <Icon className="w-4 h-4" style={{ color: t.color }} />
              </div>
              <p className="text-xl font-bold text-white tabular-nums">{t.count}</p>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-tiny" style={{ color: 'var(--text-secondary)' }}>
                  {t.label}
                </span>
                <span className="text-tiny font-semibold" style={{ color: t.color }}>
                  {t.percent}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
