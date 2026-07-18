'use server'

import { prisma } from '@/shared/lib/prisma'
import { createClient } from '@/shared/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { ResultStatus } from '@prisma/client'

export async function submitResultAction(data: {
  goalId: bigint | string | number
  value: number
  referenceDate: string
  notes?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) return { error: 'Usuário não encontrado' }

  try {
    const result = await prisma.result.create({
      data: {
        companyId: dbUser.companyId,
        goalId: BigInt(data.goalId),
        userId: dbUser.id,
        value: data.value,
        referenceDate: new Date(data.referenceDate),
        status: ResultStatus.pending, // Regra de negócio: sempre pendente até aprovação do gestor
        notes: data.notes,
        createdBy: dbUser.id,
      }
    })

    revalidatePath('/resultados')
    revalidatePath('/dashboard')
    revalidatePath('/metas')

    return { 
      data: {
        ...result,
        id: result.id.toString(),
        companyId: result.companyId.toString(),
        goalId: result.goalId.toString(),
        userId: result.userId.toString(),
        createdBy: result.createdBy?.toString()
      }, 
      error: null 
    }
  } catch (error: any) {
    console.error('Error submitting result:', error)
    return { error: error.message || 'Erro ao lançar resultado' }
  }
}

export async function listResultsAction(filters?: { status?: ResultStatus }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) return { error: 'Usuário não encontrado' }

  try {
    const results = await prisma.result.findMany({
      where: { 
        companyId: dbUser.companyId,
        active: true,
        ...(filters?.status ? { status: filters.status } : {})
      },
      include: {
        goal: {
          include: { indicator: true }
        },
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Serializa BigInts
    const serialized = results.map(r => ({
      ...r,
      value: Number(r.value),
      id: r.id.toString(),
      companyId: r.companyId.toString(),
      goalId: r.goalId.toString(),
      userId: r.userId.toString(),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      createdBy: r.createdBy?.toString(),
      updatedBy: r.updatedBy?.toString(),
      approvedBy: r.approvedBy?.toString(),
      referenceDate: r.referenceDate.toISOString(),
      approvedAt: r.approvedAt ? r.approvedAt.toISOString() : null,
      goal: {
        ...r.goal,
        id: r.goal.id.toString(),
        companyId: r.goal.companyId.toString(),
        indicatorId: r.goal.indicatorId.toString(),
        indicator: {
          ...r.goal.indicator,
          id: r.goal.indicator.id.toString(),
          companyId: r.goal.indicator.companyId.toString()
        }
      },
      user: {
        ...r.user,
        id: r.user.id.toString()
      }
    }))

    return { data: serialized, error: null }
  } catch (error: any) {
    console.error('Error listing results:', error)
    return { error: 'Erro ao buscar resultados' }
  }
}

export async function listPendingResultsAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) return { error: 'Usuário não encontrado' }

  try {
    const results = await prisma.result.findMany({
      where: {
        companyId: dbUser.companyId,
        active: true,
        status: { in: [ResultStatus.pending, ResultStatus.draft, ResultStatus.revised] }
      },
      include: {
        goal: {
          include: { indicator: true }
        },
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      },
      orderBy: { referenceDate: 'desc' }
    })

    const serialized = results.map(r => ({
      ...r,
      value: Number(r.value),
      id: r.id.toString(),
      companyId: r.companyId.toString(),
      goalId: r.goalId.toString(),
      userId: r.userId.toString(),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      createdBy: r.createdBy?.toString(),
      updatedBy: r.updatedBy?.toString(),
      approvedBy: r.approvedBy?.toString(),
      referenceDate: r.referenceDate.toISOString(),
      approvedAt: r.approvedAt ? r.approvedAt.toISOString() : null,
      goal: {
        ...r.goal,
        id: r.goal.id.toString(),
        companyId: r.goal.companyId.toString(),
        indicatorId: r.goal.indicatorId.toString(),
        indicator: {
          ...r.goal.indicator,
          id: r.goal.indicator.id.toString(),
          companyId: r.goal.indicator.companyId.toString()
        }
      },
      user: {
        ...r.user,
        id: r.user.id.toString()
      }
    }))

    return { data: serialized, error: null }
  } catch (error: any) {
    console.error('Error listing pending results:', error)
    return { error: 'Erro ao buscar resultados pendentes' }
  }
}

export async function createResultAction(data: {
  goalId: bigint | string | number
  userId: bigint | string | number
  value: number
  referenceDate: string
  notes?: string
  status?: ResultStatus
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) return { error: 'Usuário não encontrado' }

  try {
    const result = await prisma.result.create({
      data: {
        companyId: dbUser.companyId,
        goalId: BigInt(data.goalId),
        userId: BigInt(data.userId),
        value: data.value,
        referenceDate: new Date(data.referenceDate),
        status: data.status ?? ResultStatus.pending,
        notes: data.notes,
        createdBy: dbUser.id
      }
    })

    revalidatePath('/resultados')
    revalidatePath('/aprovacoes')
    revalidatePath('/dashboard')
    revalidatePath('/metas')

    return {
      data: {
        ...result,
        id: result.id.toString(),
        companyId: result.companyId.toString(),
        goalId: result.goalId.toString(),
        userId: result.userId.toString(),
        createdBy: result.createdBy?.toString()
      },
      error: null
    }
  } catch (error: any) {
    console.error('Error creating result:', error)
    return { error: error.message || 'Erro ao criar resultado' }
  }
}

export async function reviseResultAction(resultId: string | number, data: {
  value?: number
  referenceDate?: string
  notes?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) return { error: 'Usuário não encontrado' }

  try {
    const updated = await prisma.result.update({
      where: { id: BigInt(resultId), companyId: dbUser.companyId },
      data: {
        value: data.value,
        referenceDate: data.referenceDate ? new Date(data.referenceDate) : undefined,
        notes: data.notes,
        status: ResultStatus.pending,
        updatedBy: dbUser.id
      }
    })

    revalidatePath('/resultados')
    revalidatePath('/aprovacoes')
    revalidatePath('/dashboard')
    revalidatePath('/metas')

    return {
      data: {
        ...updated,
        id: updated.id.toString(),
        companyId: updated.companyId.toString(),
        goalId: updated.goalId.toString(),
        userId: updated.userId.toString(),
        createdBy: updated.createdBy?.toString(),
        updatedBy: updated.updatedBy?.toString(),
        approvedBy: updated.approvedBy?.toString()
      },
      error: null
    }
  } catch (error: any) {
    console.error('Error revising result:', error)
    return { error: error.message || 'Erro ao revisar resultado' }
  }
}

export async function approveResultAction(resultId: string | number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: { role: true }
  })

  if (!dbUser) return { error: 'Usuário não encontrado' }

  try {
    const updated = await prisma.result.update({
      where: { id: BigInt(resultId), companyId: dbUser.companyId },
      data: {
        status: ResultStatus.approved,
        approvedBy: dbUser.id,
        approvedAt: new Date(),
        updatedBy: dbUser.id
      }
    })

    revalidatePath('/resultados')
    revalidatePath('/aprovacoes')
    revalidatePath('/dashboard')
    revalidatePath('/metas')
    revalidatePath('/ranking')

    return { data: { ...updated, id: updated.id.toString() }, error: null }
  } catch (error: any) {
    console.error('Error approving result:', error)
    return { error: 'Erro ao aprovar resultado' }
  }
}

export async function rejectResultAction(resultId: string | number, reason?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) return { error: 'Usuário não encontrado' }

  try {
    const updated = await prisma.result.update({
      where: { id: BigInt(resultId), companyId: dbUser.companyId },
      data: {
        status: ResultStatus.rejected,
        notes: reason ? `[Rejeitado: ${reason}]` : '[Rejeitado pelo gestor]',
        updatedBy: dbUser.id
      }
    })

    revalidatePath('/resultados')
    revalidatePath('/aprovacoes')
    revalidatePath('/dashboard')
    revalidatePath('/metas')
    revalidatePath('/ranking')

    return { data: { ...updated, id: updated.id.toString() }, error: null }
  } catch (error: any) {
    console.error('Error rejecting result:', error)
    return { error: 'Erro ao rejeitar resultado' }
  }
}

