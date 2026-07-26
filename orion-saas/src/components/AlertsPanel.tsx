import {
  AlertTriangle, Clock, Database, Activity, MessageSquareWarning, ArrowRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Alert {
  icon: LucideIcon
  severity: 'critical' | 'warning' | 'info'
  title: string
  description: string
  time: string
}

const ALERTS: Alert[] = [
  {
    icon: AlertTriangle,
    severity: 'critical',
    title: 'Uso de IA acima do limite',
    description: 'Consumo ultrapassou 90% do limite mensal',
    time: 'há 15 min',
  },
  {
    icon: Clock,
    severity: 'warning',
    title: 'Projeto atrasado',
    description: 'Projeto LogTrack está 2 dias atrasado',
    time: 'há 1h',
  },
  {
    icon: Database,
    severity: 'warning',
    title: 'Backup não executado',
    description: 'Backup diário não executado',
    time: 'há 2h',
  },
  {
    icon: Activity,
    severity: 'info',
    title: 'Sistema instável',
    description: 'Latência alta detectada no ambiente de staging',
    time: 'há 3h',
  },
  {
    icon: MessageSquareWarning,
    severity: 'info',
    title: 'Novo chamado crítico',
    description: 'Chamado #1238 aberto pelo cliente FormaPlus',
    time: 'há 3h',
  },
]

const SEVERITY_STYLES = {
  critical: {
    iconBg: 'rgba(239, 68, 68, 0.15)',
    iconColor: '#f87171',
    label: 'Crítico',
    labelColor: '#f87171',
  },
  warning: {
    iconBg: 'rgba(245, 158, 11, 0.15)',
    iconColor: '#fbbf24',
    label: 'Alerta',
    labelColor: '#fbbf24',
  },
  info: {
    iconBg: 'rgba(59, 130, 246, 0.15)',
    iconColor: '#60a5fa',
    label: 'Info',
    labelColor: '#60a5fa',
  },
}

export function AlertsPanel() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Alertas e Notificações</h3>
        <a
          href="#"
          className="text-tiny font-medium flex items-center gap-1 transition-colors hover:opacity-80"
          style={{ color: 'var(--brand-primary)' }}
        >
          Ver todas
          <ArrowRight className="w-3 h-3" />
        </a>
      </div>

      <div className="space-y-2">
        {ALERTS.map((a, i) => {
          const Icon = a.icon
          const style = SEVERITY_STYLES[a.severity]
          return (
            <div
              key={i}
              className="flex gap-3 p-2 rounded-lg transition-colors hover:bg-white/3"
              style={{ borderLeft: `2px solid ${style.iconColor}` }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: style.iconBg }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: style.iconColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-xs font-semibold text-white truncate">{a.title}</p>
                  <span
                    className="text-tiny font-medium uppercase flex-shrink-0"
                    style={{ color: style.labelColor }}
                  >
                    {style.label}
                  </span>
                </div>
                <p
                  className="text-tiny leading-snug truncate"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {a.description}
                </p>
                <p className="text-tiny mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {a.time}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
