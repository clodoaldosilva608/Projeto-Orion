import { CheckCircle2 } from 'lucide-react'

const SERVICES = [
  'API Gateway',
  'Banco de Dados',
  'Redis',
  'Fila de Jobs',
  'Storage',
  'Serviços de IA',
  'E-mail Service',
  'Backup',
]

export function SystemStatus() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Status do Sistema</h3>
          <p className="text-tiny mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Todos os serviços operacionais
          </p>
        </div>
        <span className="badge badge-success">
          <CheckCircle2 className="w-3 h-3" />
          Operacional
        </span>
      </div>

      <div className="space-y-1">
        {SERVICES.map((service) => (
          <div
            key={service}
            className="flex items-center justify-between py-1.5 px-2 rounded-md transition-colors hover:bg-white/3"
          >
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {service}
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full pulse-dot"
                style={{ background: 'var(--success)', boxShadow: '0 0 6px var(--success)' }}
              />
              <span className="text-tiny" style={{ color: 'var(--success)' }}>
                Operacional
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
