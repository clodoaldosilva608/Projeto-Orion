import { listPendingResultsAction } from '@/modules/results/services/results.actions'
import { AlertCircle, CheckCircle2, Inbox } from 'lucide-react'
import { AprovacoesClient } from './AprovacoesClient'

export default async function AprovacoesPage() {
  const { data: results, error } = await listPendingResultsAction()

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
          <h1 className="text-2xl font-bold text-white mb-1">Aprovações de Resultados</h1>
          <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
            Revise e aproveve os lançamentos pendentes da equipe.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'rgb(var(--glass-bg))', border: '1px solid rgb(var(--glass-border))' }}>
          <CheckCircle2 className="w-4 h-4" style={{ color: 'rgb(var(--orion-indigo))' }} />
          <span className="text-sm font-medium text-white">
            {results?.length ?? 0} {((results?.length ?? 0) === 1) ? 'pendente' : 'pendentes'}
          </span>
        </div>
      </div>

      {(!results || results.length === 0) ? (
        <div className="glass-card p-12 text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'rgb(var(--surface-2))' }}>
            <Inbox className="w-8 h-8" style={{ color: 'rgb(var(--text-muted))' }} />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Nada para aprovar</h3>
          <p className="text-sm max-w-md mx-auto" style={{ color: 'rgb(var(--text-secondary))' }}>
            Não há resultados pendentes no momento. Os novos lançamentos aparecerão aqui para revisão.
          </p>
        </div>
      ) : (
        <AprovacoesClient results={results} />
      )}
    </div>
  )
}
