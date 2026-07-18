'use client'

import { useState, useTransition } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { approveResultAction } from '@/modules/results/services/results.actions'

export function ApproveButton({ resultId }: { resultId: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleApprove = () => {
    setError(null)
    startTransition(async () => {
      const res = await approveResultAction(resultId)
      if (res.error) setError(res.error)
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleApprove}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
        style={{ background: 'linear-gradient(135deg, rgb(16 185 129), rgb(6 182 212))' }}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Check className="w-4 h-4" />
        )}
        Aprovar
      </button>
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </div>
  )
}
