'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

export function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-2 rounded-xl text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
      style={{ background: 'rgb(var(--orion-indigo))' }}
    >
      {pending && <Loader2 className="w-4 h-4 animate-spin" />}
      Salvar Campanha
    </button>
  )
}
