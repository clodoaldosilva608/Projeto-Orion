'use server'

import { prisma } from '@/shared/lib/prisma'
import { createClient } from '@/shared/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function getCompanyAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado', data: null }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: { company: true }
  })

  if (!dbUser) return { error: 'Usuário não encontrado', data: null }

  const c = dbUser.company

  return {
    data: {
      id: c.id.toString(),
      legalName: c.legalName,
      tradeName: c.tradeName,
      cnpj: c.cnpj,
      email: c.email,
      phone: c.phone,
      website: c.website,
      address: c.address,
      addressNumber: c.addressNumber,
      complement: c.complement,
      district: c.district,
      city: c.city,
      state: c.state,
      zipCode: c.zipCode,
      country: c.country,
      logoUrl: c.logoUrl,
      theme: c.theme,
      language: c.language,
      currency: c.currency,
      timezone: c.timezone,
      plan: c.plan,
      trialEndsAt: c.trialEndsAt?.toISOString() ?? null,
      createdAt: c.createdAt.toISOString(),
    },
    error: null
  }
}

export async function updateCompanyAction(data: {
  tradeName?: string
  legalName?: string
  cnpj?: string
  email?: string
  phone?: string
  website?: string
  address?: string
  addressNumber?: string
  complement?: string
  district?: string
  city?: string
  state?: string
  zipCode?: string
  timezone?: string
  currency?: string
  language?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) return { error: 'Usuário não encontrado' }

  // Remove campos undefined para não sobrescrever com null
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined && v !== '')
  )

  try {
    await prisma.company.update({
      where: { id: dbUser.companyId },
      data: {
        ...cleanData,
        updatedBy: dbUser.id,
      }
    })

    revalidatePath('/configuracoes')
    revalidatePath('/empresa')
    return { error: null }
  } catch (error: any) {
    console.error('Error updating company:', error)
    return { error: error.message || 'Erro ao salvar configurações' }
  }
}
