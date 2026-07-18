'use server'

import { createClient } from '@/shared/lib/supabase-server'
import { prisma } from '@/shared/lib/prisma'
import { revalidatePath } from 'next/cache'

/**
 * Lista as campanhas da empresa do usuário logado.
 */
export async function listCampaignsAction() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: 'Não autorizado' }
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      select: { companyId: true }
    })

    if (!dbUser) {
      return { data: null, error: 'Usuário não encontrado' }
    }

    const campaigns = await prisma.campaign.findMany({
      where: {
        companyId: dbUser.companyId,
        deletedAt: null
      },
      include: {
        _count: {
          select: { participants: true, goals: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return { 
      data: campaigns.map(c => ({
        ...c,
        id: c.id.toString(),
        companyId: c.companyId.toString(),
        createdBy: c.createdBy?.toString()
      })), 
      error: null 
    }
  } catch (error: any) {
    console.error('Erro ao listar campanhas:', error)
    return { data: null, error: 'Erro ao listar campanhas' }
  }
}

/**
 * Cria uma nova campanha.
 */
export async function createCampaignAction(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Não autorizado' }
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      select: { id: true, companyId: true }
    })

    if (!dbUser) {
      return { error: 'Usuário não encontrado' }
    }

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const startDateStr = formData.get('startDate') as string
    const endDateStr = formData.get('endDate') as string

    if (!name || !startDateStr || !endDateStr) {
      return { error: 'Campos obrigatórios: Nome, Data Inicial e Data Final' }
    }

    await prisma.campaign.create({
      data: {
        name,
        description,
        startDate: new Date(startDateStr),
        endDate: new Date(endDateStr),
        companyId: dbUser.companyId,
        createdBy: dbUser.id,
        status: 'draft',
      }
    })

    revalidatePath('/campanhas')
    return { error: null }
  } catch (error: any) {
    console.error('Erro ao criar campanha:', error)
    return { error: 'Erro ao criar campanha' }
  }
}

/**
 * Exclui logicamente (soft delete) uma campanha.
 */
export async function deleteCampaignAction(campaignId: string) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Não autorizado' }
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      select: { id: true, companyId: true }
    })

    if (!dbUser) {
      return { error: 'Usuário não encontrado' }
    }

    await prisma.campaign.update({
      where: {
        id: BigInt(campaignId),
        companyId: dbUser.companyId, // Segurança: garantir tenant
      },
      data: {
        deletedAt: new Date()
      }
    })

    revalidatePath('/campanhas')
    return { error: null }
  } catch (error: any) {
    console.error('Erro ao deletar campanha:', error)
    return { error: 'Erro ao deletar campanha' }
  }
}
