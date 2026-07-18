'use server'

import { prisma } from '@/shared/lib/prisma'
import { createClient } from '@/shared/lib/supabase-server'

export interface RankingEntry {
  position: number
  userId: string
  name: string
  email: string
  avatarUrl: string | null
  jobTitle: string | null
  totalValue: number
  approvedCount: number
  goalCount: number
  avgProgress: number
}

export async function getRankingAction(period?: 'week' | 'month' | 'quarter' | 'all'): Promise<{
  data: RankingEntry[] | null
  error: string | null
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado', data: null }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) return { error: 'Usuário não encontrado', data: null }

  // Define o intervalo de datas baseado no período
  let dateFilter: { gte: Date } | undefined = undefined
  const now = new Date()

  if (period === 'week') {
    const start = new Date(now)
    start.setDate(now.getDate() - 7)
    dateFilter = { gte: start }
  } else if (period === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    dateFilter = { gte: start }
  } else if (period === 'quarter') {
    const quarter = Math.floor(now.getMonth() / 3)
    const start = new Date(now.getFullYear(), quarter * 3, 1)
    dateFilter = { gte: start }
  }

  try {
    // Busca todos os resultados aprovados da empresa
    const results = await prisma.result.findMany({
      where: {
        companyId: dbUser.companyId,
        status: 'approved',
        active: true,
        ...(dateFilter ? { createdAt: dateFilter } : {})
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true, jobTitle: true }
        }
      }
    })

    // Busca total de metas por usuário (para progresso médio)
    const goals = await prisma.goal.findMany({
      where: {
        companyId: dbUser.companyId,
        active: true,
        ...(dateFilter ? { startDate: dateFilter } : {})
      },
      include: {
        results: {
          where: { status: 'approved', active: true }
        }
      }
    })

    // Agrega por usuário
    const userMap: Record<string, {
      userId: string
      name: string
      email: string
      avatarUrl: string | null
      jobTitle: string | null
      totalValue: number
      approvedCount: number
    }> = {}

    for (const r of results) {
      const uid = r.user.id.toString()
      if (!userMap[uid]) {
        userMap[uid] = {
          userId: uid,
          name: r.user.name,
          email: r.user.email,
          avatarUrl: r.user.avatarUrl,
          jobTitle: r.user.jobTitle,
          totalValue: 0,
          approvedCount: 0,
        }
      }
      userMap[uid].totalValue += Number(r.value)
      userMap[uid].approvedCount += 1
    }

    // Calcula progresso médio por usuário
    const userProgressMap: Record<string, { count: number; totalPct: number }> = {}
    for (const goal of goals) {
      const uid = goal.userId?.toString()
      if (!uid) continue
      const achieved = goal.results.reduce((acc, r) => acc + Number(r.value), 0)
      const target = Number(goal.targetValue)
      const pct = target > 0 ? Math.min(100, (achieved / target) * 100) : 0
      if (!userProgressMap[uid]) userProgressMap[uid] = { count: 0, totalPct: 0 }
      userProgressMap[uid].count++
      userProgressMap[uid].totalPct += pct
    }

    // Monta ranking final
    const ranking: RankingEntry[] = Object.values(userMap)
      .sort((a, b) => b.totalValue - a.totalValue)
      .map((entry, idx) => {
        const prog = userProgressMap[entry.userId]
        return {
          ...entry,
          position: idx + 1,
          goalCount: prog?.count ?? 0,
          avgProgress: prog ? Math.round(prog.totalPct / prog.count) : 0,
        }
      })

    return { data: ranking, error: null }
  } catch (error: any) {
    console.error('Error getting ranking:', error)
    return { error: 'Erro ao buscar ranking', data: null }
  }
}
