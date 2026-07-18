import { listResultsAction } from '@/modules/results/services/results.actions'
import { listGoalsAction } from '@/modules/goals/services/goals.actions'
import SubmitResultForm from './SubmitResultForm'
import ApproveResultAction from './ApproveResultAction'
import { AlertCircle, Clock, CheckCircle2, TrendingUp, XCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function ResultadosPage() {
  const [goalsRes, resultsRes] = await Promise.all([
    listGoalsAction(),
    listResultsAction()
  ])

  const goals = goalsRes.data || []
  const results = resultsRes.data || []

  const pendingCount = results.filter((r: { status: string }) => r.status === 'pending' || r.status === 'draft' || r.status === 'revised').length

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Lançamento de Resultados</h1>
          <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
            Registre suas vendas e acompanhe o histórico da equipe.
          </p>
        </div>
        {pendingCount > 0 && (
          <Link
            href="/aprovacoes"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5"
            style={{ background: 'rgb(var(--orion-indigo) / 0.15)', color: 'rgb(var(--orion-indigo))', border: '1px solid rgb(var(--orion-indigo) / 0.3)' }}
          >
            <CheckCircle2 className="w-4 h-4" />
            {pendingCount} {pendingCount === 1 ? 'pendente' : 'pendentes'} para aprovar
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lado Esquerdo: Formulário */}
        <div className="lg:col-span-1">
          <SubmitResultForm goals={goals} />
        </div>

        {/* Lado Direito: Feed de Resultados */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6 min-h-[500px]">
            <h3 className="font-semibold text-white mb-5 flex items-center gap-2 pb-2" style={{ borderBottom: '1px solid rgb(var(--glass-border))' }}>
              <TrendingUp className="w-4 h-4" style={{ color: 'rgb(var(--orion-indigo))' }} />
              Histórico de Resultados
            </h3>

            {results.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm" style={{ color: 'rgb(var(--text-muted))' }}>Nenhum resultado lançado ainda.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result: any) => {
                  const isPending = result.status === 'pending'
                  const isApproved = result.status === 'approved'
                  const isRejected = result.status === 'rejected'
                  
                  return (
                    <div 
                      key={result.id} 
                      className="flex items-center justify-between p-4 rounded-xl transition-colors hover:bg-white/5"
                      style={{ background: 'rgb(var(--surface-1))', border: '1px solid rgb(var(--glass-border))' }}
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                          style={{ background: 'linear-gradient(135deg, rgb(99 102 241), rgb(168 85 247))' }}
                        >
                          {result.user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">
                            {result.user.name} <span style={{ color: 'rgb(var(--text-muted))', fontWeight: 'normal' }}>lançou</span> {Number(result.value).toLocaleString('pt-BR')} {result.goal.indicator.unit}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-secondary))' }}>
                            em {result.goal.name} • {new Date(result.referenceDate).toLocaleDateString('pt-BR')}
                          </p>
                          {result.notes && (
                            <p className="text-xs mt-1 italic" style={{ color: 'rgb(var(--text-muted))' }}>
                              "{result.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {isPending && (
                          <div className="flex items-center gap-2">
                            <span className="badge badge-warning flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Pendente
                            </span>
                            {/* Actions for Manager (Mocking everyone as manager for now) */}
                            <ApproveResultAction resultId={result.id} />
                          </div>
                        )}
                        {isApproved && (
                          <span className="badge badge-success flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Aprovado
                          </span>
                        )}
                        {isRejected && (
                          <span className="badge badge-error flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Rejeitado
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
