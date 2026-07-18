import { listCategoriesAction, listIndicatorsAction } from '@/modules/indicators/services/indicators.actions'
import { AlertCircle, BarChart3 } from 'lucide-react'
import { IndicadoresClient } from './IndicadoresClient'

export default async function IndicadoresPage() {
  const [categoriesRes, indicatorsRes] = await Promise.all([
    listCategoriesAction(),
    listIndicatorsAction()
  ])

  const error = categoriesRes.error || indicatorsRes.error

  if (error) {
    return (
      <div className="p-6">
        <div
          className="rounded-xl p-4 flex items-center gap-3"
          style={{ background: 'rgb(244 63 94 / 0.1)', border: '1px solid rgb(244 63 94 / 0.3)' }}
        >
          <AlertCircle className="w-5 h-5 text-rose-500" />
          <p className="text-sm text-rose-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <IndicadoresClient
        categories={categoriesRes.data ?? []}
        indicators={indicatorsRes.data ?? []}
      />
    </div>
  )
}
