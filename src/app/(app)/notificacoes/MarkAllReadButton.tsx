'use client'

import { CheckCheck } from 'lucide-react'
import { markAllAsReadAction } from '@/modules/notifications/services/notifications.actions'
import { useTransition } from 'react'

export function MarkAllReadButton() {
  const [isPending, startTransition] = useTransition()

  const handleMarkAll = () => {
    startTransition(async () => {
      await markAllAsReadAction()
    })
  }

  return (
    <button
      onClick={handleMarkAll}
      disabled={isPending}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80 disabled:opacity-50"
      style={{ 
        background: 'rgb(var(--surface-3))', 
        color: 'white',
        border: '1px solid rgb(var(--glass-border))'
      }}
    >
      <CheckCheck className="w-4 h-4" />
      Marcar todas como lidas
    </button>
  )
}
