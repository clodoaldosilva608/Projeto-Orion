import { listNotificationsAction } from '@/modules/notifications/services/notifications.actions'
import { NotificationItem } from './NotificationItem'
import { MarkAllReadButton } from './MarkAllReadButton'
import { Bell, Inbox } from 'lucide-react'

export default async function NotificacoesPage() {
  const { data: notifications, error } = await listNotificationsAction()

  const unreadCount = notifications?.filter(n => !n.readAt).length || 0

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Central de Notificações</h1>
          <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
            Acompanhe atualizações, metas e recados da sua equipe.
          </p>
        </div>
        {unreadCount > 0 && <MarkAllReadButton />}
      </div>

      {error && (
        <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: 'rgb(244 63 94 / 0.1)', border: '1px solid rgb(244 63 94 / 0.3)' }}>
          <p className="text-sm text-rose-500">{error}</p>
        </div>
      )}

      {/* Stats/Filters Row */}
      <div className="flex items-center gap-4 border-b pb-4" style={{ borderColor: 'rgb(var(--glass-border))' }}>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors bg-indigo-500/10 text-indigo-400">
          <Bell className="w-4 h-4" />
          Não Lidas
          {unreadCount > 0 && (
            <span className="ml-1 bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-white/5 text-gray-400">
          <Inbox className="w-4 h-4" />
          Todas
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {(!notifications || notifications.length === 0) ? (
          <div className="py-12 text-center rounded-2xl" style={{ background: 'rgb(var(--glass-bg))', border: '1px solid rgb(var(--glass-border))' }}>
            <Inbox className="w-12 h-12 mx-auto mb-4 opacity-50 text-indigo-400" />
            <h3 className="text-lg font-medium text-white mb-1">Nenhuma notificação</h3>
            <p className="text-sm" style={{ color: 'rgb(var(--text-muted))' }}>Você está em dia! Nada novo por aqui.</p>
          </div>
        ) : (
          notifications.map(notification => (
            <NotificationItem key={notification.id} notification={notification} />
          ))
        )}
      </div>
    </div>
  )
}
