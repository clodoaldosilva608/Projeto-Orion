'use client'

import { deleteCategoryAction } from '@/modules/indicators/services/indicators.actions'
import { Trash2 } from 'lucide-react'
import { useTransition } from 'react'

export function DeleteCategoryButton({ categoryId }: { categoryId: string }) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!confirm('Tem certeza que deseja excluir esta categoria? Os indicadores nela permanecerão visíveis (sem categoria).')) return

    startTransition(async () => {
      await deleteCategoryAction(categoryId)
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-50"
      title="Excluir categoria"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
