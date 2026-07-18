'use server'

import { prisma } from '@/shared/lib/prisma'
import { createClient } from '@/shared/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export interface AdminMetrics {
  totalUsers: number
  totalBranches: number
  totalGoals: number
  totalIndicators: number
  totalLicenses: number
}

export interface AdminRolePermission {
  id: string
  permissionId: string
  module: string
  action: string
  description: string | null
}

export interface AdminRole {
  id: string
  name: string
  slug: string
  description: string | null
  isSystem: boolean
  permissions: AdminRolePermission[]
}

export interface AdminPermission {
  id: string
  module: string
  action: string
  slug: string
  description: string | null
}

export async function getAdminDashboardAction(): Promise<{ data: AdminMetrics | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) return { data: null, error: 'Usuário não encontrado' }

  try {
    const [
      totalUsers,
      totalBranches,
      totalGoals,
      totalIndicators,
      totalLicenses
    ] = await Promise.all([
      prisma.user.count({ where: { companyId: dbUser.companyId, active: true } }),
      prisma.branch.count({ where: { companyId: dbUser.companyId, active: true } }),
      prisma.goal.count({ where: { companyId: dbUser.companyId, active: true } }),
      prisma.indicator.count({ where: { companyId: dbUser.companyId, active: true } }),
      prisma.license.count({
        where: {
          companies: { some: { id: dbUser.companyId } },
          active: true
        }
      })
    ])

    return {
      data: {
        totalUsers,
        totalBranches,
        totalGoals,
        totalIndicators,
        totalLicenses
      },
      error: null
    }
  } catch (error: unknown) {
    console.error('Error fetching admin dashboard:', error)
    return { data: null, error: 'Erro ao buscar métricas do painel administrativo' }
  }
}

export async function listRolesAction(): Promise<{ data: AdminRole[]; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: [], error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) return { data: [], error: 'Usuário não encontrado' }

  try {
    const roles = await prisma.role.findMany({
      where: {
        companyId: dbUser.companyId,
        active: true
      },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    const serialized: AdminRole[] = roles.map((role) => ({
      id: role.id.toString(),
      name: role.name,
      slug: role.slug,
      description: role.description,
      isSystem: role.isSystem,
      permissions: role.rolePermissions.map((rp) => ({
        id: rp.id.toString(),
        permissionId: rp.permissionId.toString(),
        module: rp.permission.module,
        action: rp.permission.action,
        description: rp.permission.description
      }))
    }))

    return { data: serialized, error: null }
  } catch (error: unknown) {
    console.error('Error listing roles:', error)
    return { data: [], error: 'Erro ao buscar os cargos' }
  }
}

export async function listPermissionsAction(): Promise<{ data: AdminPermission[]; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: [], error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) return { data: [], error: 'Usuário não encontrado' }

  try {
    const permissions = await prisma.permission.findMany({
      where: { active: true },
      orderBy: [{ module: 'asc' }, { action: 'asc' }]
    })

    const serialized: AdminPermission[] = permissions.map((p) => ({
      id: p.id.toString(),
      module: p.module,
      action: p.action,
      slug: p.slug,
      description: p.description
    }))

    return { data: serialized, error: null }
  } catch (error: unknown) {
    console.error('Error listing permissions:', error)
    return { data: [], error: 'Erro ao buscar as permissões' }
  }
}

export interface CreateRoleInput {
  name: string
  description?: string
  permissionIds: string[]
}

export async function createRoleAction(data: CreateRoleInput): Promise<{ data: AdminRole | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) return { data: null, error: 'Usuário não encontrado' }

  const name = data.name?.trim()
  if (!name) return { data: null, error: 'Informe o nome do cargo.' }

  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)

  if (!slug) return { data: null, error: 'Nome do cargo inválido para gerar o identificador.' }

  try {
    const existing = await prisma.role.findFirst({
      where: { companyId: dbUser.companyId, slug }
    })
    if (existing) return { data: null, error: 'Já existe um cargo com esse nome.' }

    const permissionIds = Array.from(
      new Set(data.permissionIds.map((id) => BigInt(id)))
    )

    const role = await prisma.role.create({
      data: {
        companyId: dbUser.companyId,
        name,
        slug,
        description: data.description?.trim() || null
      },
      include: {
        rolePermissions: { include: { permission: true } }
      }
    })

    if (permissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId: role.id,
          permissionId
        }))
      })
    }

    const full = await prisma.role.findUnique({
      where: { id: role.id },
      include: { rolePermissions: { include: { permission: true } } }
    })

    revalidatePath('/admin')

    const result: AdminRole = {
      id: full!.id.toString(),
      name: full!.name,
      slug: full!.slug,
      description: full!.description,
      isSystem: full!.isSystem,
      permissions: full!.rolePermissions.map((rp) => ({
        id: rp.id.toString(),
        permissionId: rp.permissionId.toString(),
        module: rp.permission.module,
        action: rp.permission.action,
        description: rp.permission.description
      }))
    }

    return { data: result, error: null }
  } catch (error: unknown) {
    console.error('Error creating role:', error)
    const message = error instanceof Error ? error.message : 'Erro ao criar o cargo'
    return { data: null, error: message }
  }
}

export async function updateUserRoleAction(
  userId: string,
  roleId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) return { error: 'Usuário não encontrado' }

  try {
    const target = await prisma.user.findUnique({
      where: { id: BigInt(userId), companyId: dbUser.companyId }
    })
    if (!target) return { error: 'Usuário não encontrado' }

    const role = await prisma.role.findUnique({
      where: { id: BigInt(roleId), companyId: dbUser.companyId }
    })
    if (!role) return { error: 'Cargo não encontrado' }

    await prisma.user.update({
      where: { id: target.id, companyId: dbUser.companyId },
      data: { roleId: role.id, updatedBy: dbUser.id }
    })

    revalidatePath('/admin')
    revalidatePath('/equipe')

    return { error: null }
  } catch (error: unknown) {
    console.error('Error updating user role:', error)
    const message = error instanceof Error ? error.message : 'Erro ao atualizar o cargo do usuário'
    return { error: message }
  }
}
