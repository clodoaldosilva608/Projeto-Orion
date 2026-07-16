'use client'

import { useState } from 'react'
import InviteUserModal from './InviteUserModal'
import { updateUserStatusAction } from '@/modules/users/services/users.actions'
import {
  UserPlus, Users, CheckCircle2, Clock, AlertCircle,
  XCircle, Mail, MoreVertical, Shield
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  status: string
  jobTitle: string | null
  avatarUrl: string | null
  createdAt: string
  lastLoginAt: string | null
  role: { name: string; slug: string } | null
  branch: { name: string } | null
  isCurrentUser: boolean
}

interface Props {
  users: User[]
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: 'Ativo', color: 'badge-success', icon: CheckCircle2 },
  pending: { label: 'Pendente', color: 'badge-warning', icon: Clock },
  invited: { label: 'Convidado', color: 'badge-info', icon: Mail },
  suspended: { label: 'Suspenso', color: 'badge-error', icon: XCircle },
  inactive: { label: 'Inativo', color: '', icon: AlertCircle },
}

export default function EquipeClient({ users }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  async function handleStatusChange(userId: string, status: 'active' | 'suspended' | 'inactive') {
    setLoading(userId)
    setOpenMenu(null)
    await updateUserStatusAction(userId, status)
    setLoading(null)
    router.refresh()
  }

  return (
    <>
      {showModal && <InviteUserModal onClose={() => setShowModal(false)} />}

      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-400" />
              Gestão da Equipe
            </h1>
            <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
              {users.length} membro{users.length !== 1 ? 's' : ''} na sua organização
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-gradient inline-flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4 relative z-10" />
            <span>Convidar Membro</span>
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: users.length, color: 'text-white' },
            { label: 'Ativos', value: users.filter(u => u.status === 'active').length, color: 'text-emerald-400' },
            { label: 'Convidados', value: users.filter(u => u.status === 'invited').length, color: 'text-blue-400' },
            { label: 'Suspensos', value: users.filter(u => u.status === 'suspended').length, color: 'text-rose-400' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-xl text-center"
              style={{ background: 'rgb(var(--surface-1))', border: '1px solid rgb(var(--glass-border))' }}
            >
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabela */}
        <div className="glass-card overflow-hidden">
          <div className="p-5" style={{ borderBottom: '1px solid rgb(var(--glass-border))' }}>
            <h2 className="font-semibold text-white text-sm">Membros da Equipe</h2>
          </div>

          {users.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: 'rgb(var(--text-muted))' }} />
              <p className="text-sm" style={{ color: 'rgb(var(--text-muted))' }}>
                Nenhum membro cadastrado. Convide o primeiro!
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgb(var(--glass-border))' }}>
              {users.map((user) => {
                const statusInfo = STATUS_MAP[user.status] ?? STATUS_MAP['inactive']
                const StatusIcon = statusInfo.icon
                return (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors"
                  >
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: `hsl(${(parseInt(user.id) * 47) % 360}, 60%, 40%)` }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                        {user.isCurrentUser && (
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgb(99 102 241 / 0.15)', color: 'rgb(var(--orion-indigo))' }}>
                            Você
                          </span>
                        )}
                      </div>
                      <p className="text-xs truncate mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>
                        {user.email}
                      </p>
                    </div>

                    {/* Cargo */}
                    <div className="hidden sm:block text-right min-w-[120px]">
                      <p className="text-xs text-white truncate">{user.jobTitle ?? '—'}</p>
                      {user.role && (
                        <p className="text-xs mt-0.5 flex items-center justify-end gap-1" style={{ color: 'rgb(var(--text-muted))' }}>
                          <Shield className="w-3 h-3" /> {user.role.name}
                        </p>
                      )}
                    </div>

                    {/* Status badge */}
                    <span className={`badge ${statusInfo.color} hidden md:flex items-center gap-1 flex-shrink-0`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusInfo.label}
                    </span>

                    {/* Actions menu */}
                    {!user.isCurrentUser && (
                      <div className="relative flex-shrink-0">
                        <button
                          onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                          disabled={loading === user.id}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                          style={{ color: 'rgb(var(--text-muted))' }}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openMenu === user.id && (
                          <div
                            className="absolute right-0 top-10 w-44 rounded-xl shadow-2xl z-20 overflow-hidden"
                            style={{ background: 'rgb(var(--surface-1))', border: '1px solid rgb(var(--glass-border))' }}
                          >
                            {user.status !== 'active' && (
                              <button
                                onClick={() => handleStatusChange(user.id, 'active')}
                                className="w-full px-4 py-2.5 text-xs text-left flex items-center gap-2 hover:bg-white/10 transition-colors text-emerald-400"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Ativar
                              </button>
                            )}
                            {user.status !== 'suspended' && (
                              <button
                                onClick={() => handleStatusChange(user.id, 'suspended')}
                                className="w-full px-4 py-2.5 text-xs text-left flex items-center gap-2 hover:bg-white/10 transition-colors text-rose-400"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Suspender
                              </button>
                            )}
                            {user.status !== 'inactive' && (
                              <button
                                onClick={() => handleStatusChange(user.id, 'inactive')}
                                className="w-full px-4 py-2.5 text-xs text-left flex items-center gap-2 hover:bg-white/10 transition-colors"
                                style={{ color: 'rgb(var(--text-muted))' }}
                              >
                                <AlertCircle className="w-3.5 h-3.5" /> Inativar
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
