import {
  FolderPlus, CreditCard, Rocket, KeyRound, Upload, ArrowRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Activity {
  icon: LucideIcon
  iconBg: string
  iconColor: string
  title: string
  description: string
  time: string
}

const ACTIVITIES: Activity[] = [
  {
    icon: FolderPlus,
    iconBg: 'rgba(16, 185, 129, 0.15)',
    iconColor: '#34d399',
    title: 'Novo projeto criado',
    description: 'FormaPlus LTDA criou projeto FIManager App',
    time: 'há 20 min',
  },
  {
    icon: CreditCard,
    iconBg: 'rgba(16, 185, 129, 0.15)',
    iconColor: '#34d399',
    title: 'Pagamento aprovado',
    description: 'Pagamento de R$ 2.850,00 aprovado — Plano Profissional',
    time: 'há 42 min',
  },
  {
    icon: Rocket,
    iconBg: 'rgba(139, 92, 246, 0.15)',
    iconColor: '#a78bfa',
    title: 'Aplicação publicada',
    description: 'Aplicação FormaPlus v1.2.3 publicada com sucesso',
    time: 'há 1h',
  },
  {
    icon: KeyRound,
    iconBg: 'rgba(59, 130, 246, 0.15)',
    iconColor: '#60a5fa',
    title: 'Licença renovada',
    description: 'Licença anual do BioSaude Clínica renovada',
    time: 'há 2h',
  },
  {
    icon: Upload,
    iconBg: 'rgba(139, 92, 246, 0.15)',
    iconColor: '#a78bfa',
    title: 'Deploy realizado',
    description: 'Deploy da aplicação MarketPro em produção',
    time: 'há 3h',
  },
]

export function ActivityFeed() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Atividades Recentes</h3>
        <a
          href="#"
          className="text-tiny font-medium flex items-center gap-1 transition-colors hover:opacity-80"
          style={{ color: 'var(--brand-primary)' }}
        >
          Ver todas
          <ArrowRight className="w-3 h-3" />
        </a>
      </div>

      <div className="space-y-3">
        {ACTIVITIES.map((a, i) => {
          const Icon = a.icon
          return (
            <div key={i} className="flex gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: a.iconBg }}
              >
                <Icon className="w-4 h-4" style={{ color: a.iconColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white leading-tight">{a.title}</p>
                <p
                  className="text-xs mt-0.5 leading-snug"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {a.description}
                </p>
                <p className="text-tiny mt-1" style={{ color: 'var(--text-muted)' }}>
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
