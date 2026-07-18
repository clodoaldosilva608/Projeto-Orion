'use client'

import { deleteIndicatorAction } from '@/modules/indicators/services/indicators.actions'
import { Trash2 } from 'lucide-react'
import { useTransition } from 'react'

export function DeleteIndicatorButton({ indicatorId }: { indicatorId: string }) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!confirm('Tem certeza que deseja excluir este indicador?')) return

    startTransition(async () => {
      await deleteIndicatorAction(indicatorId)
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-50"
      title="Excluir indicador"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
