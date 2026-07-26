import { Cpu, MemoryStick, HardDrive, Database, ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Resource {
  label: string
  percent: number
  icon: LucideIcon
  color: string
  status: 'ok' | 'warning' | 'critical'
}

const RESOURCES: Resource[] = [
  { label: 'CPU', percent: 48, icon: Cpu, color: '#10b981', status: 'ok' },
  { label: 'Memória', percent: 82, icon: MemoryStick, color: '#f59e0b', status: 'warning' },
  { label: 'Storage', percent: 38, icon: HardDrive, color: '#10b981', status: 'ok' },
  { label: 'Banco de Dados', percent: 71, icon: Database, color: '#ef4444', status: 'critical' },
]

const STATUS_LABELS = {
  ok: { label: 'Saudável', color: '#10b981' },
  warning: { label: 'Atenção', color: '#f59e0b' },
  critical: { label: 'Crítico', color: '#ef4444' },
}

export function ResourceUsage() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Consumo de Recursos</h3>
          <p className="text-tiny mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Monitoramento em tempo real · Hoje
          </p>
        </div>
        <a
          href="#"
          className="text-tiny font-medium flex items-center gap-1 transition-colors hover:opacity-80"
          style={{ color: 'var(--brand-primary)' }}
        >
          Ver detalhes
          <ArrowRight className="w-3 h-3" />
        </a>
      </div>

      <div className="space-y-3">
        {RESOURCES.map((r) => {
          const Icon = r.icon
          const status = STATUS_LABELS[r.status]
          return (
            <div key={r.label}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {r.label}
                  </span>
                  <span className="text-tiny" style={{ color: status.color }}>
                    · {status.label}
                  </span>
                </div>
                <span
                  className="text-xs font-bold tabular-nums"
                  style={{ color: r.color }}
                >
                  {r.percent}%
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${r.percent}%`,
                    background: `linear-gradient(90deg, ${r.color}99, ${r.color})`,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
