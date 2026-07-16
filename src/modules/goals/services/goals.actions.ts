'use server'

import { prisma } from '@/shared/lib/prisma'
import { createClient } from '@/shared/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function createGoalAction(data: {
  name: string
  description?: string
  indicatorId: bigint | number
  targetValue: number
  startDate: string
  endDate: string
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Busca o usuário logado para pegar a empresa
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) {
    return { error: 'Usuário não encontrado' }
  }

  try {
    const goal = await prisma.goal.create({
      data: {
        companyId: dbUser.companyId,
        indicatorId: BigInt(data.indicatorId),
        name: data.name,
        description: data.description,
        type: data.type,
        targetValue: data.targetValue,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        createdBy: dbUser.id,
      }
    })

    revalidatePath('/metas')
    revalidatePath('/dashboard')

    return { 
      data: {
        ...goal,
        id: goal.id.toString(),
        companyId: goal.companyId.toString(),
        indicatorId: goal.indicatorId.toString(),
        createdBy: goal.createdBy?.toString()
      }, 
      error: null 
    }
  } catch (error: any) {
    console.error('Error creating goal:', error)
    return { error: error.message || 'Erro ao criar a meta' }
  }
}

export async function listGoalsAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) return { error: 'Usuário não encontrado' }

  try {
    const goals = await prisma.goal.findMany({
      where: { 
        companyId: dbUser.companyId,
        active: true 
      },
      include: {
        indicator: true,
        results: {
          where: { status: 'approved' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Serializa os BigInts
    const serializedGoals = goals.map(goal => ({
      ...goal,
      id: goal.id.toString(),
      companyId: goal.companyId.toString(),
      indicatorId: goal.indicatorId.toString(),
      createdBy: goal.createdBy?.toString(),
      updatedBy: goal.updatedBy?.toString(),
      campaignId: goal.campaignId?.toString(),
      branchId: goal.branchId?.toString(),
      userId: goal.userId?.toString(),
      indicator: {
        ...goal.indicator,
        id: goal.indicator.id.toString(),
        companyId: goal.indicator.companyId.toString(),
        categoryId: goal.indicator.categoryId?.toString(),
      },
      results: goal.results.map(r => ({
        ...r,
        id: r.id.toString(),
        companyId: r.companyId.toString(),
        goalId: r.goalId.toString(),
        userId: r.userId.toString()
      }))
    }))

    return { data: serializedGoals, error: null }
  } catch (error: any) {
    console.error('Error listing goals:', error)
    return { error: 'Erro ao buscar metas' }
  }
}
