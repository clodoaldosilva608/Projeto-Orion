'use client'

import { Bell, Check, CheckCircle2, Clock, Inbox } from 'lucide-react'
import { markAsReadAction } from '@/modules/notifications/services/notifications.actions'
import { useState, useTransition } from 'react'

export function NotificationItem({ notification }: { notification: any }) {
  const [isPending, startTransition] = useTransition()
  const [isRead, setIsRead] = useState(!!notification.readAt)

  const handleMarkAsRead = () => {
    if (isRead) return
    startTransition(async () => {
      const res = await markAsReadAction(notification.id)
      if (!res.error) {
        setIsRead(true)
      }
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
      case 'urgent':
        return 'text-rose-500'
      default:
        return 'text-indigo-400'
    }
  }

  return (
    <div 
      className={`p-4 rounded-xl flex items-start gap-4 transition-colors ${isRead ? 'opacity-70' : ''}`}
      style={{ 
        background: isRead ? 'rgb(var(--surface-3) / 0.5)' : 'rgb(var(--surface-3))',
        border: '1px solid rgb(var(--glass-border))'
      }}
    >
      <div className={`mt-1 flex-shrink-0 ${getPriorityColor(notification.priority)}`}>
        <Bell className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-semibold mb-1 ${isRead ? 'text-gray-300' : 'text-white'}`}>
          {notification.title}
        </h4>
        <p className="text-sm leading-relaxed" style={{ color: 'rgb(var(--text-secondary))' }}>
          {notification.body}
        </p>
        <div className="flex items-center gap-4 mt-3">
          <span className="text-xs flex items-center gap-1" style={{ color: 'rgb(var(--text-muted))' }}>
            <Clock className="w-3 h-3" />
            {new Date(notification.createdAt).toLocaleDateString('pt-BR', { 
              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
            })}
          </span>
        </div>
      </div>
      {!isRead && (
        <button
          onClick={handleMarkAsRead}
          disabled={isPending}
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-indigo-500/20 text-indigo-400 disabled:opacity-50"
          title="Marcar como lida"
        >
          <Check className="w-4 h-4" />
        </button>
      )}
      {isRead && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-emerald-500">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      )}
    </div>
  )
}
