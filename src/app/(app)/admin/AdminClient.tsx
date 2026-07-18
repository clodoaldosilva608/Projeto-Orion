'use client'

import { useState, useTransition } from 'react'
import {
  Users,
  Building2,
  Target,
  BarChart3,
  KeyRound,
  Plus,
  Loader2,
  ShieldCheck,
  Check
} from 'lucide-react'
import {
  createRoleAction,
  updateUserRoleAction,
  type AdminRole,
  type AdminPermission,
  type AdminMetrics
} from '@/modules/admin/services/admin.actions'

interface AdminUser {
  id: string
  name: string
  email: string
  role: { name: string; slug: string } | null
  branch: { name: string } | null
}

const METRIC_CARDS: {
  key: keyof AdminMetrics
  label: string
  icon: React.ReactNode
}[] = [
  { key: 'totalUsers', label: 'Usuários', icon: <Users className="w-5 h-5" /> },
  { key: 'totalBranches', label: 'Filiais', icon: <Building2 className="w-5 h-5" /> },
  { key: 'totalGoals', label: 'Metas', icon: <Target className="w-5 h-5" /> },
  { key: 'totalIndicators', label: 'Indicadores', icon: <BarChart3 className="w-5 h-5" /> },
  { key: 'totalLicenses', label: 'Licenças', icon: <KeyRound className="w-5 h-5" /> }
]

export function AdminClient({
  metrics,
  roles,
  permissions,
  users
}: {
  metrics: AdminMetrics | null
  roles: AdminRole[]
  permissions: AdminPermission[]
  users: AdminUser[]
}) {
  const [localRoles, setLocalRoles] = useState<AdminRole[]>(roles)
  const [localUsers, setLocalUsers] = useState<AdminUser[]>(users)

  return (
    <div className="space-y-6">
      {/* Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {METRIC_CARDS.map((card) => (
          <div key={card.key} className="glass-card p-5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: 'rgb(var(--orion-indigo) / 0.15)', color: 'rgb(var(--orion-indigo))' }}
            >
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-white">
              {metrics ? metrics[card.key] : 0}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-secondary))' }}>
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* Cargos e Permissões */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RolesSection roles={localRoles} setRoles={setLocalRoles} permissions={permissions} />

        {/* Troca de cargo dos usuários */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" style={{ color: 'rgb(var(--orion-indigo))' }} />
            Cargos dos usuários
          </h3>
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {localUsers.length === 0 && (
              <p className="text-sm" style={{ color: 'rgb(var(--text-muted))' }}>
                Nenhum usuário encontrado.
              </p>
            )}
            {localUsers.map((u) => (
              <UserRoleRow
                key={u.id}
                user={u}
                roles={localRoles}
                onUpdated={(userId, roleName) =>
                  setLocalUsers((prev) =>
                    prev.map((p) =>
                      p.id === userId
                        ? { ...p, role: roleName ? { name: roleName, slug: '' } : null }
                        : p
                    )
                  )
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function RolesSection({
  roles,
  setRoles,
  permissions
}: {
  roles: AdminRole[]
  setRoles: React.Dispatch<React.SetStateAction<AdminRole[]>>
  permissions: AdminPermission[]
}) {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" style={{ color: 'rgb(var(--orion-indigo))' }} />
          Cargos ({roles.length})
        </h3>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-all hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, rgb(99 102 241), rgb(168 85 247))' }}
        >
          <Plus className="w-4 h-4" />
          Novo cargo
        </button>
      </div>

      {showForm && (
        <NewRoleForm
          permissions={permissions}
          onCreated={(role) => {
            setRoles((prev) => [...prev, role])
            setShowForm(false)
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {roles.length === 0 && !showForm && (
          <p className="text-sm" style={{ color: 'rgb(var(--text-muted))' }}>
            Nenhum cargo cadastrado.
          </p>
        )}
        {roles.map((role) => (
          <div
            key={role.id}
            className="p-3 rounded-xl"
            style={{ background: 'rgb(var(--surface-1))' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">{role.name}</p>
                {role.description && (
                  <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
                    {role.description}
                  </p>
                )}
              </div>
              {role.isSystem && (
                <span className="badge badge-info text-[10px] uppercase">Sistema</span>
              )}
            </div>
            <p className="text-xs mt-2" style={{ color: 'rgb(var(--text-secondary))' }}>
              {role.permissions.length} permissão(ões)
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function NewRoleForm({
  permissions,
  onCreated,
  onCancel
}: {
  permissions: AdminPermission[]
  onCreated: (role: AdminRole) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const grouped = permissions.reduce<Record<string, AdminPermission[]>>((acc, p) => {
    acc[p.module] = acc[p.module] ?? []
    acc[p.module].push(p)
    return acc
  }, {})

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleCreate = () => {
    setError(null)
    startTransition(async () => {
      const res = await createRoleAction({
        name,
        description,
        permissionIds: Array.from(selected)
      })
      if (res.error) {
        setError(res.error)
      } else if (res.data) {
        onCreated(res.data)
      }
    })
  }

  return (
    <div
      className="mb-4 p-4 rounded-xl space-y-3"
      style={{ background: 'rgb(var(--surface-1))', border: '1px solid rgb(var(--glass-border))' }}
    >
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
          Nome do cargo
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Gerente de Vendas"
          className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder:text-[rgb(var(--text-muted))] outline-none"
          style={{ background: 'rgb(var(--surface-2))', border: '1px solid rgb(var(--glass-border))' }}
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
          Descrição (opcional)
        </label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Breve descrição do cargo"
          className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder:text-[rgb(var(--text-muted))] outline-none"
          style={{ background: 'rgb(var(--surface-2))', border: '1px solid rgb(var(--glass-border))' }}
        />
      </div>

      <div>
        <p className="text-xs font-medium mb-2" style={{ color: 'rgb(var(--text-secondary))' }}>
          Permissões
        </p>
        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
          {Object.entries(grouped).map(([module, perms]) => (
            <div key={module}>
              <p className="text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'rgb(var(--text-muted))' }}>
                {module}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {perms.map((p) => {
                  const checked = selected.has(p.id)
                  return (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-xs transition-colors"
                      style={{
                        background: checked ? 'rgb(var(--orion-indigo) / 0.15)' : 'transparent',
                        border: '1px solid rgb(var(--glass-border))'
                      }}
                    >
                      <span
                        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                        style={{
                          background: checked ? 'rgb(var(--orion-indigo))' : 'transparent',
                          border: '1px solid rgb(var(--text-muted))'
                        }}
                      >
                        {checked && <Check className="w-3 h-3 text-white" />}
                      </span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(p.id)}
                        className="sr-only"
                      />
                      <span className="text-white truncate">{p.action}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-rose-400">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={handleCreate}
          disabled={isPending}
          className="btn-gradient inline-flex items-center justify-center gap-2 flex-1 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {isPending ? 'Criando...' : 'Criar cargo'}
        </button>
        <button
          onClick={onCancel}
          disabled={isPending}
          className="px-3 py-2 rounded-lg text-sm text-white/80 transition-colors hover:bg-white/5"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

function UserRoleRow({
  user,
  roles,
  onUpdated
}: {
  user: AdminUser
  roles: AdminRole[]
  onUpdated: (userId: string, roleName: string | null) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [roleId, setRoleId] = useState<string>(user.role ? findRoleId(roles, user.role.name) : '')

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRoleId = e.target.value
    setRoleId(newRoleId)
    setError(null)
    startTransition(async () => {
      const res = await updateUserRoleAction(user.id, newRoleId)
      if (res.error) {
        setError(res.error)
        setRoleId(user.role ? findRoleId(roles, user.role.name) : '')
      } else {
        const role = roles.find((r) => r.id === newRoleId)
        onUpdated(user.id, role ? role.name : null)
      }
    })
  }

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl" style={{ background: 'rgb(var(--surface-1))' }}>
      <div className="min-w-0">
        <p className="text-sm font-medium text-white truncate">{user.name}</p>
        <p className="text-xs truncate" style={{ color: 'rgb(var(--text-muted))' }}>
          {user.email}
          {user.branch ? ` · ${user.branch.name}` : ''}
        </p>
        {error && <p className="text-xs text-rose-400 mt-0.5">{error}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {isPending && <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'rgb(var(--text-muted))' }} />}
        <select
          value={roleId}
          onChange={handleChange}
          disabled={isPending}
          className="px-2 py-1.5 rounded-lg text-xs text-white outline-none disabled:opacity-50"
          style={{ background: 'rgb(var(--surface-2))', border: '1px solid rgb(var(--glass-border))' }}
        >
          <option value="">Sem cargo</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

function findRoleId(roles: AdminRole[], name: string): string {
  const found = roles.find((r) => r.name === name)
  return found ? found.id : ''
}
