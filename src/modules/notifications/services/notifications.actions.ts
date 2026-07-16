'use server'

import { createClient } from '@/shared/lib/supabase-server'
import { prisma } from '@/shared/lib/prisma'
import { revalidatePath } from 'next/cache'

/**
 * Lista as notificações do usuário logado.
 */
export async function listNotificationsAction() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: 'Não autorizado' }
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      select: { id: true, companyId: true }
    })

    if (!dbUser) {
      return { data: null, error: 'Usuário não encontrado' }
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: dbUser.id,
        companyId: dbUser.companyId,
        deletedAt: null
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return { 
      data: notifications.map(n => ({
        ...n,
        id: n.id.toString(),
        companyId: n.companyId.toString(),
        userId: n.userId.toString()
      })), 
      error: null 
    }
  } catch (error: any) {
    console.error('Erro ao listar notificações:', error)
    return { data: null, error: 'Erro ao listar notificações' }
  }
}

/**
 * Marca uma notificação como lida.
 */
export async function markAsReadAction(notificationId: string) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: 'Não autorizado' }
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      select: { id: true, companyId: true }
    })

    if (!dbUser) {
      return { data: null, error: 'Usuário não encontrado' }
    }

    await prisma.notification.update({
      where: {
        id: BigInt(notificationId),
        userId: dbUser.id, // garante que só marca as próprias
        companyId: dbUser.companyId
      },
      data: {
        readAt: new Date()
      }
    })

    revalidatePath('/notificacoes')
    return { error: null }
  } catch (error: any) {
    console.error('Erro ao marcar notificação como lida:', error)
    return { error: 'Erro ao atualizar notificação' }
  }
}

/**
 * Marca todas as notificações do usuário como lidas.
 */
export async function markAllAsReadAction() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: 'Não autorizado' }
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      select: { id: true, companyId: true }
    })

    if (!dbUser) {
      return { data: null, error: 'Usuário não encontrado' }
    }

    await prisma.notification.updateMany({
      where: {
        userId: dbUser.id,
        companyId: dbUser.companyId,
        readAt: null,
        deletedAt: null
      },
      data: {
        readAt: new Date()
      }
    })

    revalidatePath('/notificacoes')
    return { error: null }
  } catch (error: any) {
    console.error('Erro ao marcar todas notificações como lidas:', error)
    return { error: 'Erro ao atualizar notificações' }
  }
}
