'use server'

import { prisma } from '@/shared/lib/prisma'
import { createClient } from '@/shared/lib/supabase-server'

export async function listIndicatorsAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) return { error: 'Usuário não encontrado' }

  try {
    const indicators = await prisma.indicator.findMany({
      where: { 
        companyId: dbUser.companyId,
        active: true 
      },
      orderBy: { name: 'asc' }
    })

    // Serializa BigInts
    const serialized = indicators.map(ind => ({
      ...ind,
      id: ind.id.toString(),
      companyId: ind.companyId.toString(),
      categoryId: ind.categoryId?.toString(),
      createdBy: ind.createdBy?.toString(),
      updatedBy: ind.updatedBy?.toString()
    }))

    return { data: serialized, error: null }
  } catch (error: any) {
    console.error('Error listing indicators:', error)
    return { error: 'Erro ao buscar indicadores' }
  }
}
