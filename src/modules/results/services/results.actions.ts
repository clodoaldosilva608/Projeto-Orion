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
      id: r.id.toString(),
      companyId: r.companyId.toString(),
      goalId: r.goalId.toString(),
      userId: r.userId.toString(),
      createdBy: r.createdBy?.toString(),
      updatedBy: r.updatedBy?.toString(),
      approvedBy: r.approvedBy?.toString(),
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
    revalidatePath('/dashboard')
    revalidatePath('/metas')
    revalidatePath('/ranking')

    return { data: { ...updated, id: updated.id.toString() }, error: null }
  } catch (error: any) {
    console.error('Error rejecting result:', error)
    return { error: 'Erro ao rejeitar resultado' }
  }
}

