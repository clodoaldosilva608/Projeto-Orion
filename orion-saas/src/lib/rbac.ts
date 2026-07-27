import { prisma } from './db'
import { createSupabaseServerClient } from './supabase'

export async function getCurrentUserWithPermissions() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: {
      role: {
        include: {
          rolePermissions: { include: { permission: true } },
        },
      },
    },
  })
  if (!dbUser) return null

  const permissions = dbUser.role?.rolePermissions?.map(rp => rp.permission.slug) || []
  return {
    id: dbUser.id,
    companyId: dbUser.companyId,
    roleId: dbUser.roleId,
    name: dbUser.name,
    email: dbUser.email,
    roleName: dbUser.role?.name || 'Sem cargo',
    roleSlug: dbUser.role?.slug || 'viewer',
    isSuperAdmin: dbUser.role?.slug === 'admin' && dbUser.role?.isSystem === true,
    permissions,
  }
}

export function hasPermission(user: Awaited<ReturnType<typeof getCurrentUserWithPermissions>>, perm: string): boolean {
  if (!user) return false
  if (user.isSuperAdmin) return true
  return user.permissions.includes(perm)
}

export function canAccess(user: Awaited<ReturnType<typeof getCurrentUserWithPermissions>>, ...perms: string[]): boolean {
  if (!user) return false
  if (user.isSuperAdmin) return true
  return perms.some(p => user.permissions.includes(p))
}

// Mapeamento de rotas para permissões necessárias
export const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/metas': ['goals:read', 'goals:create'],
  '/metas/nova': ['goals:create'],
  '/indicadores': ['indicators:read'],
  '/resultados': ['results:read', 'results:create'],
  '/aprovacoes': ['results:approve'],
  '/ranking': ['reports:read'],
  '/campanhas': ['goals:read'],
  '/gamificacao': ['results:read'],
  '/calendario': ['results:read'],
  '/usuarios': ['users:read'],
  '/funcoes-permissoes': ['admin:access'],
  '/logs-auditoria': ['admin:access'],
  '/configuracoes': ['admin:access'],
}
