'use client'

import { useState, useTransition } from 'react'
import { KeyRound, Loader2, CheckCircle2 } from 'lucide-react'
import {
  activateLicenseAction,
  type SerializedLicense
} from '@/modules/licensing/services/licensing.actions'

export function ActivateLicenseForm({
  onActivated
}: {
  onActivated?: (license: SerializedLicense) => void
}) {
  const [key, setKey] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!key.trim()) {
      setError('Digite a chave de licença.')
      return
    }

    startTransition(async () => {
      const res = await activateLicenseAction(key)
      if (res.error) {
        setError(res.error)
      } else if (res.data) {
        setSuccess('Licença ativada com sucesso!')
        setKey('')
        if (onActivated) onActivated(res.data)
      }
    })
  }

  return (
    <form onSubmit={handleActivate} className="space-y-3">
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
          Chave de ativação
        </label>
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value.toUpperCase())}
          placeholder="XXXX-XXXX-XXXX"
          disabled={isPending}
          className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder:text-[rgb(var(--text-muted))] outline-none transition-all focus:ring-2"
          style={{
            background: 'rgb(var(--surface-1))',
            border: '1px solid rgb(var(--glass-border))',
            // @ts-expect-error -- CSS custom prop for ring color
            '--tw-ring-color': 'rgb(var(--orion-indigo) / 0.5)'
          }}
        />
      </div>

      {error && (
        <div
          className="rounded-lg px-3 py-2 flex items-center gap-2 text-xs"
          style={{ background: 'rgb(244 63 94 / 0.1)', color: 'rgb(244 63 94)' }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="rounded-lg px-3 py-2 flex items-center gap-2 text-xs"
          style={{ background: 'rgb(16 185 129 / 0.1)', color: 'rgb(16 185 129)' }}
        >
          <CheckCircle2 className="w-4 h-4" />
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn-gradient inline-flex items-center justify-center gap-2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <KeyRound className="w-4 h-4 relative z-10" />
        )}
        <span>{isPending ? 'Ativando...' : 'Ativar licença'}</span>
      </button>
    </form>
  )
}
