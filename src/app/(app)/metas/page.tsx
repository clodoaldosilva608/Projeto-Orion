import { listGoalsAction } from '@/modules/goals/services/goals.actions'
import { Target, Plus, Calendar, TrendingUp, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { DeleteGoalButton } from './DeleteGoalButton'
export default async function MetasPage() {
  const { data: goals, error } = await listGoalsAction()

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'rgb(244 63 94 / 0.1)', border: '1px solid rgb(244 63 94 / 0.3)' }}>
          <AlertCircle className="w-5 h-5 text-rose-500" />
          <p className="text-sm text-rose-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Metas e Campanhas</h1>
          <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
            Acompanhe o progresso dos objetivos da equipe
          </p>
        </div>
        <Link 
          href="/metas/nova"
          className="btn-gradient inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4 relative z-10" />
          <span>Nova Meta</span>
        </Link>
      </div>

      {/* Empty State */}
      {(!goals || goals.length === 0) && (
        <div className="glass-card p-12 text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'rgb(var(--surface-2))' }}>
            <Target className="w-8 h-8" style={{ color: 'rgb(var(--text-muted))' }} />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Nenhuma meta encontrada</h3>
          <p className="text-sm max-w-md mx-auto mb-6" style={{ color: 'rgb(var(--text-secondary))' }}>
            Você ainda não possui metas cadastradas. Crie sua primeira meta para engajar sua equipe de vendas.
          </p>
          <Link 
            href="/metas/nova"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'rgb(var(--orion-indigo) / 0.15)', color: 'rgb(var(--orion-indigo))', border: '1px solid rgb(var(--orion-indigo) / 0.3)' }}
          >
            Criar Meta
          </Link>
        </div>
      )}

      {/* Grid de Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {goals?.map((goal, i) => {
          // Calcula progresso baseado nos resultados aprovados
          const totalAchieved = goal.results.reduce((acc: number, r: any) => acc + Number(r.value), 0)
          const targetValue = Number(goal.targetValue)
          const percentage = targetValue > 0 ? Math.min(100, Math.round((totalAchieved / targetValue) * 100)) : 0
          
          return (
            <div 
              key={goal.id} 
              className="glass-card p-5 hover:shadow-lg transition-all animate-fade-in-up group"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, rgb(99 102 241), rgb(168 85 247))' }}
                  >
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white truncate max-w-[150px]" title={goal.name}>
                      {goal.name}
                    </h3>
                    <span className="badge badge-info mt-1 uppercase" style={{ fontSize: '10px' }}>
                      {goal.type === 'monthly' ? 'Mensal' : goal.type}
                    </span>
                  </div>
                </div>
                <DeleteGoalButton goalId={goal.id} />
              </div>

              <div className="space-y-4">
                {/* Métricas */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl" style={{ background: 'rgb(var(--surface-1))' }}>
                  <div>
                    <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>Alvo ({goal.indicator.unit})</p>
                    <p className="font-bold text-white mt-0.5">{targetValue.toLocaleString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>Realizado</p>
                    <p className="font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                      {totalAchieved.toLocaleString('pt-BR')} 
                      {percentage >= 100 && <TrendingUp className="w-3 h-3" />}
                    </p>
                  </div>
                </div>

                {/* Progresso */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span style={{ color: 'rgb(var(--text-secondary))' }}>Progresso</span>
                    <span className="font-medium" style={{ color: 'rgb(var(--orion-indigo))' }}>{percentage}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-fill" 
                      style={{ 
                        width: `${percentage}%`,
                        background: percentage >= 100 ? 'linear-gradient(90deg, rgb(var(--orion-emerald)), rgb(var(--orion-cyan)))' : undefined
                      }} 
                    />
                  </div>
                </div>

                {/* Footer do Card */}
                <div className="flex items-center justify-between pt-3 mt-2" style={{ borderTop: '1px solid rgb(var(--glass-border))' }}>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(goal.startDate).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })} até {new Date(goal.endDate).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
