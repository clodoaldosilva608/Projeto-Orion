import { listIndicatorsAction } from '@/modules/goals/services/indicators.actions'
import NovaMetaForm from './NovaMetaForm'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default async function NovaMetaPage() {
  const { data: indicators, error } = await listIndicatorsAction()

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <Link 
          href="/metas"
          className="inline-flex items-center gap-1 text-sm font-medium mb-3 transition-colors hover:opacity-80"
          style={{ color: 'rgb(var(--orion-indigo))' }}
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Metas
        </Link>
        <h1 className="text-2xl font-bold text-white mb-1">Criar Nova Meta</h1>
        <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
          Configure um novo objetivo de performance para a equipe.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'rgb(244 63 94 / 0.1)', border: '1px solid rgb(244 63 94 / 0.3)' }}>
          <AlertCircle className="w-5 h-5 text-rose-500" />
          <p className="text-sm text-rose-500">{error}</p>
        </div>
      ) : (
        <NovaMetaForm indicators={indicators || []} />
      )}
    </div>
  )
}
