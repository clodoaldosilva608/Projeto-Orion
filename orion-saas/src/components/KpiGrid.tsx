import {
  Users, FolderKanban, Boxes, KeyRound, DollarSign, Brain,
  TrendingUp, type LucideIcon,
} from 'lucide-react'

interface Kpi {
  label: string
  value: string
  change: string
  icon: LucideIcon
  iconColor: string
  iconBg: string
}

const KPIS: Kpi[] = [
  {
    label: 'Clientes',
    value: '1.248',
    change: '+12,3%',
    icon: Users,
    iconColor: '#60a5fa',
    iconBg: 'rgba(59, 130, 246, 0.12)',
  },
  {
    label: 'Projetos Ativos',
    value: '342',
    change: '+8,7%',
    icon: FolderKanban,
    iconColor: '#a78bfa',
    iconBg: 'rgba(139, 92, 246, 0.12)',
  },
  {
    label: 'Aplicações Publicadas',
    value: '278',
    change: '+15,2%',
    icon: Boxes,
    iconColor: '#34d399',
    iconBg: 'rgba(16, 185, 129, 0.12)',
  },
  {
    label: 'Licenças Ativas',
    value: '1.035',
    change: '+10,2%',
    icon: KeyRound,
    iconColor: '#fbbf24',
    iconBg: 'rgba(245, 158, 11, 0.12)',
  },
  {
    label: 'Receita Mensal (MRR)',
    value: 'R$ 286.580,00',
    change: '+18,6%',
    icon: DollarSign,
    iconColor: '#10b981',
    iconBg: 'rgba(16, 185, 129, 0.12)',
  },
  {
    label: 'Uso de IA Líder',
    value: '24.586',
    change: '+22,4%',
    icon: Brain,
    iconColor: '#f472b6',
    iconBg: 'rgba(236, 72, 153, 0.12)',
  },
]

export function KpiGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {KPIS.map((kpi, i) => {
        const Icon = kpi.icon
        return (
          <div
            key={kpi.label}
            className="kpi-card animate-fade-in"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: kpi.iconBg }}
              >
                <Icon className="w-4 h-4" style={{ color: kpi.iconColor }} />
              </div>
              <span
                className="text-tiny font-semibold flex items-center gap-0.5"
                style={{ color: '#34d399' }}
              >
                <TrendingUp className="w-3 h-3" />
                {kpi.change}
              </span>
            </div>
            <p
              className="text-2xl font-bold text-white tracking-tight mb-0.5"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {kpi.value}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {kpi.label}
            </p>
            <p className="text-tiny mt-1" style={{ color: 'var(--text-muted)' }}>
              vs mês anterior
            </p>
          </div>
        )
      })}
    </div>
  )
}
