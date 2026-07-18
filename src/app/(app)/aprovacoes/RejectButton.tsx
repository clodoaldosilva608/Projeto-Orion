'use client'

import { useState, useTransition } from 'react'
import { X, Loader2 } from 'lucide-react'
import { rejectResultAction } from '@/modules/results/services/results.actions'

export function RejectButton({ resultId }: { resultId: string }) {
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleReject = () => {
    setError(null)
    startTransition(async () => {
      const res = await rejectResultAction(resultId, reason.trim() || undefined)
      if (res.error) {
        setError(res.error)
      } else {
        setOpen(false)
        setReason('')
      }
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
        style={{ background: 'rgb(244 63 94 / 0.12)', color: 'rgb(244 63 94)', border: '1px solid rgb(244 63 94 / 0.3)' }}
      >
        <X className="w-4 h-4" />
        Rejeitar
      </button>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1.5 w-full max-w-xs">
      <textarea
        autoFocus
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Motivo da rejeição (opcional)..."
        className="orion-input resize-y min-h-[60px] text-sm w-full"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={() => { setOpen(false); setReason(''); setError(null) }}
          disabled={isPending}
          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          style={{ background: 'rgb(var(--surface-2))', color: 'rgb(var(--text-secondary))' }}
        >
          Cancelar
        </button>
        <button
          onClick={handleReject}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'rgb(244 63 94)' }}
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
          Confirmar
        </button>
      </div>
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </div>
  )
}
