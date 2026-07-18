'use client'

import { useState, useTransition } from 'react'
import { RefreshCw, Loader2 } from 'lucide-react'
import { renewLicenseAction } from '@/modules/licensing/services/licensing.actions'

export function RenewButton({ licenseId }: { licenseId: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleRenew = () => {
    setError(null)
    startTransition(async () => {
      const res = await renewLicenseAction(licenseId)
      if (res.error) setError(res.error)
    })
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handleRenew}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
        style={{ background: 'linear-gradient(135deg, rgb(99 102 241), rgb(168 85 247))' }}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
        Renovar (+1 ano)
      </button>
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </div>
  )
}
