'use server'

import { prisma } from '@/shared/lib/prisma'
import { createClient } from '@/shared/lib/supabase-server'
import { AuditAction } from '@prisma/client'

export interface AuditLogFilters {
  tableName?: string
  action?: AuditAction
  userId?: string | number
  from?: string
  to?: string
  limit?: number
  skip?: number
}

export async function listAuditLogsAction(filters?: AuditLogFilters) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) return { error: 'Usuário não encontrado' }

  try {
    const where: {
      companyId: bigint
      tableName?: string
      action?: AuditAction
      userId?: bigint
      createdAt?: { gte?: Date; lte?: Date }
    } = { companyId: dbUser.companyId }

    if (filters?.tableName) where.tableName = filters.tableName
    if (filters?.action) where.action = filters.action
    if (filters?.userId) where.userId = BigInt(filters.userId)
    if (filters?.from || filters?.to) {
      where.createdAt = {}
      if (filters.from) where.createdAt.gte = new Date(filters.from)
      if (filters.to) where.createdAt.lte = new Date(filters.to)
    }

    const take = Math.min(filters?.limit ?? 50, 200)
    const skip = filters?.skip ?? 0

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip
    })

    const serialized = logs.map(log => ({
      ...log,
      id: log.id.toString(),
      companyId: log.companyId.toString(),
      userId: log.userId?.toString() ?? null,
      recordId: log.recordId?.toString() ?? null,
      createdAt: log.createdAt.toISOString(),
      user: log.user ? { ...log.user, id: log.user.id.toString() } : null
    }))

    return { data: serialized, error: null }
  } catch (error: any) {
    console.error('Error listing audit logs:', error)
    return { error: 'Erro ao buscar logs de auditoria' }
  }
}

export interface AuditStatItem {
  key: string
  count: number
}

export async function getAuditStatsAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) return { error: 'Usuário não encontrado' }

  try {
    const [byAction, byTable, total] = await Promise.all([
      prisma.auditLog.groupBy({
        by: ['action'],
        where: { companyId: dbUser.companyId },
        _count: { _all: true }
      }),
      prisma.auditLog.groupBy({
        by: ['tableName'],
        where: { companyId: dbUser.companyId },
        _count: { _all: true },
        orderBy: { _count: { tableName: 'desc' } },
        take: 10
      }),
      prisma.auditLog.count({
        where: { companyId: dbUser.companyId }
      })
    ])

    const byActionStats: AuditStatItem[] = byAction.map((row) => ({
      key: row.action,
      count: row._count._all
    }))

    const byTableStats: AuditStatItem[] = byTable.map((row) => ({
      key: row.tableName,
      count: row._count._all
    }))

    return {
      data: {
        total,
        byAction: byActionStats,
        byTable: byTableStats
      },
      error: null
    }
  } catch (error: any) {
    console.error('Error getting audit stats:', error)
    return { error: 'Erro ao buscar estatísticas de auditoria' }
  }
}
