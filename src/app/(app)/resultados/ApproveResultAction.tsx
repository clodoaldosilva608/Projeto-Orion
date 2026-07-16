'use client'

import { useState, useTransition } from 'react'
import { Check, X, Loader2 } from 'lucide-react'
import { approveResultAction, rejectResultAction } from '@/modules/results/services/results.actions'

export default function ApproveResultAction({ resultId }: { resultId: string }) {
  const [isPending, startTransition] = useTransition()
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)

  const handleApprove = () => {
    setAction('approve')
    startTransition(async () => {
      await approveResultAction(resultId)
      setAction(null)
    })
  }

  const handleReject = () => {
    setAction('reject')
    startTransition(async () => {
      await rejectResultAction(resultId)
      setAction(null)
    })
  }

  const isLoading = isPending

  return (
    <div className="flex gap-1.5">
      <button
        onClick={handleApprove}
        disabled={isLoading}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-emerald-500/20 text-emerald-400 disabled:opacity-50"
        title="Aprovar resultado"
      >
        {isLoading && action === 'approve' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Check className="w-3.5 h-3.5" />
        )}
      </button>
      <button
        onClick={handleReject}
        disabled={isLoading}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-rose-500/20 text-rose-400 disabled:opacity-50"
        title="Rejeitar resultado"
      >
        {isLoading && action === 'reject' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <X className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  )
}
