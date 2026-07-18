import { ShieldCheck, AlertCircle } from 'lucide-react'
import {
  getAdminDashboardAction,
  listRolesAction,
  listPermissionsAction,
  type AdminRole,
  type AdminPermission,
  type AdminMetrics
} from '@/modules/admin/services/admin.actions'
import { listUsersAction } from '@/modules/users/services/users.actions'
import { AdminClient } from './AdminClient'

interface AdminUser {
  id: string
  name: string
  email: string
  role: { name: string; slug: string } | null
  branch: { name: string } | null
}

export default async function AdminPage() {
  const [metricsRes, rolesRes, permsRes, usersRes] = await Promise.all([
    getAdminDashboardAction(),
    listRolesAction(),
    listPermissionsAction(),
    listUsersAction()
  ])

  const metrics: AdminMetrics | null = metricsRes.data
  const roles: AdminRole[] = rolesRes.error ? [] : rolesRes.data
  const permissions: AdminPermission[] = permsRes.error ? [] : permsRes.data
  const users: AdminUser[] = usersRes.error || !usersRes.data ? [] : (usersRes.data as unknown as AdminUser[])

  if (metricsRes.error) {
    return (
      <div className="p-6">
        <div
          className="rounded-xl p-4 flex items-center gap-3"
          style={{ background: 'rgb(244 63 94 / 0.1)', border: '1px solid rgb(244 63 94 / 0.3)' }}
        >
          <AlertCircle className="w-5 h-5 text-rose-500" />
          <p className="text-sm text-rose-500">{metricsRes.error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7" style={{ color: 'rgb(var(--orion-indigo))' }} />
            Painel Administrativo
          </h1>
          <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
            Visão geral da empresa, cargos e permissões
          </p>
        </div>
      </div>

      <AdminClient metrics={metrics} roles={roles} permissions={permissions} users={users} />
    </div>
  )
}
