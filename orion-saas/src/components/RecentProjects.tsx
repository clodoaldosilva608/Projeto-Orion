import { ArrowRight } from 'lucide-react'

interface Project {
  name: string
  client: string
  status: 'planning' | 'dev' | 'testing' | 'homolog' | 'waiting' | 'done'
  progress: number
  updatedAt: string
  color: string
}

const PROJECTS: Project[] = [
  {
    name: 'FormaPlus',
    client: 'FormaPlus LTDA',
    status: 'dev',
    progress: 65,
    updatedAt: '16/05/2025 09:30',
    color: '#60a5fa',
  },
  {
    name: 'BioSaude',
    client: 'BioSaude Clínica',
    status: 'testing',
    progress: 80,
    updatedAt: '16/05/2025 08:15',
    color: '#fbbf24',
  },
  {
    name: 'FIManager',
    client: 'FIManager App',
    status: 'planning',
    progress: 25,
    updatedAt: '15/05/2025 14:45',
    color: '#3b82f6',
  },
  {
    name: 'MarketPro',
    client: 'MarketPro Comercial',
    status: 'homolog',
    progress: 95,
    updatedAt: '15/05/2025 11:30',
    color: '#fb923c',
  },
  {
    name: 'LogTrack',
    client: 'LogTrack Sistemas',
    status: 'waiting',
    progress: 60,
    updatedAt: '14/05/2025 17:05',
    color: '#f87171',
  },
]

const STATUS_LABELS: Record<Project['status'], { label: string; cls: string }> = {
  planning: { label: 'Planejamento', cls: 'badge-info' },
  dev: { label: 'Em Desenvolvimento', cls: 'badge-info' },
  testing: { label: 'Em Testes', cls: 'badge-warning' },
  homolog: { label: 'Homologação', cls: 'badge-warning' },
  waiting: { label: 'Aguardando Cliente', cls: 'badge-danger' },
  done: { label: 'Concluído', cls: 'badge-success' },
}

export function RecentProjects() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Projetos Recentes</h3>
        <a
          href="#"
          className="text-tiny font-medium flex items-center gap-1 transition-colors hover:opacity-80"
          style={{ color: 'var(--brand-primary)' }}
        >
          Ver todos
          <ArrowRight className="w-3 h-3" />
        </a>
      </div>

      <div className="overflow-x-auto -mx-2">
        <table className="w-full">
          <thead>
            <tr>
              {['Projeto', 'Cliente', 'Status', 'Progresso', 'Atualizado'].map((h) => (
                <th
                  key={h}
                  className="text-left px-2 pb-2 text-tiny font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PROJECTS.map((p) => {
              const status = STATUS_LABELS[p.status]
              return (
                <tr
                  key={p.name}
                  className="transition-colors hover:bg-white/3"
                  style={{ borderTop: '1px solid var(--border-subtle)' }}
                >
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-tiny font-bold text-white flex-shrink-0"
                        style={{ background: p.color }}
                      >
                        {p.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-white">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {p.client}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    <span className={`badge ${status.cls}`}>{status.label}</span>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <div className="progress-bar w-20">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${p.progress}%`,
                            background: `linear-gradient(90deg, ${p.color}, ${p.color}cc)`,
                          }}
                        />
                      </div>
                      <span
                        className="text-tiny font-medium tabular-nums"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {p.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <span className="text-tiny tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      {p.updatedAt}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
