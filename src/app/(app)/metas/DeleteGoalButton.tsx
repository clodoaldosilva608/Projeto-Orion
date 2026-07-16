'use client'

import { deleteGoalAction } from '@/modules/goals/services/goals.actions'
import { Trash2 } from 'lucide-react'
import { useTransition } from 'react'

export function DeleteGoalButton({ goalId }: { goalId: string }) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!confirm('Tem certeza que deseja excluir esta meta?')) return

    startTransition(async () => {
      await deleteGoalAction(goalId)
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-50"
      title="Excluir meta"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
