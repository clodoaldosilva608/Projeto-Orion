'use client'

import { useState, useTransition } from 'react'
import { Ban, Loader2 } from 'lucide-react'
import { revokeLicenseAction } from '@/modules/licensing/services/licensing.actions'

export function RevokeButton({ licenseId }: { licenseId: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleRevoke = () => {
    setError(null)
    if (!confirm('Tem certeza que deseja revogar esta licença? Isso desativará o acesso.')) {
      return
    }
    startTransition(async () => {
      const res = await revokeLicenseAction(licenseId)
      if (res.error) setError(res.error)
    })
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handleRevoke}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
        style={{ background: 'linear-gradient(135deg, rgb(244 63 94), rgb(220 38 38))' }}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Ban className="w-4 h-4" />
        )}
        Revogar
      </button>
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </div>
  )
}
