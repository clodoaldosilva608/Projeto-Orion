'use server'

import { prisma } from '@/shared/lib/prisma'
import { isValidLicenseKey } from '@/modules/licensing/lib/license-key'
import { createClient } from '@/shared/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export type LicenseStatus = 'trial' | 'active' | 'suspended' | 'expired' | 'canceled'

export interface SerializedLicense {
  id: string
  plan: string
  status: LicenseStatus
  maxUsers: number
  maxBranches: number
  maxIndicators: number
  startDate: string
  expirationDate: string
  trialEndsAt: string | null
  price: string | null
  currency: string
  notes: string | null
  createdAt: string
  updatedAt: string
  active: boolean
}

function serializeLicense(license: {
  id: bigint
  plan: string
  status: LicenseStatus
  maxUsers: number
  maxBranches: number
  maxIndicators: number
  startDate: Date
  expirationDate: Date
  trialEndsAt: Date | null
  price: { toString(): string } | null
  currency: string
  notes: string | null
  createdAt: Date
  updatedAt: Date
  active: boolean
}): SerializedLicense {
  return {
    id: license.id.toString(),
    plan: license.plan,
    status: license.status,
    maxUsers: license.maxUsers,
    maxBranches: license.maxBranches,
    maxIndicators: license.maxIndicators,
    startDate: license.startDate.toISOString(),
    expirationDate: license.expirationDate.toISOString(),
    trialEndsAt: license.trialEndsAt ? license.trialEndsAt.toISOString() : null,
    price: license.price ? license.price.toString() : null,
    currency: license.currency,
    notes: license.notes,
    createdAt: license.createdAt.toISOString(),
    updatedAt: license.updatedAt.toISOString(),
    active: license.active,
  }
}

export async function getCompanyLicenseAction(): Promise<{ data: SerializedLicense | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) return { data: null, error: 'Usuário não encontrado' }

  try {
    const license = await prisma.license.findFirst({
      where: {
        companies: { some: { id: dbUser.companyId } },
        active: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return {
      data: license ? serializeLicense(license) : null,
      error: null
    }
  } catch (error: unknown) {
    console.error('Error fetching company license:', error)
    return { data: null, error: 'Erro ao buscar a licença da empresa' }
  }
}

export async function listLicensesAction(): Promise<{ data: SerializedLicense[]; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: [], error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) return { data: [], error: 'Usuário não encontrado' }

  try {
    const licenses = await prisma.license.findMany({
      where: {
        companies: { some: { id: dbUser.companyId } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return {
      data: licenses.map(serializeLicense),
      error: null
    }
  } catch (error: unknown) {
    console.error('Error listing licenses:', error)
    return { data: [], error: 'Erro ao buscar as licenças' }
  }
}

export async function activateLicenseAction(key: string): Promise<{ data: SerializedLicense | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) return { data: null, error: 'Usuário não encontrado' }

  if (!isValidLicenseKey(key)) {
    return { data: null, error: 'Chave de licença inválida. Use o formato XXXX-XXXX-XXXX.' }
  }

  try {
    const now = new Date()
    const expiration = new Date(now)
    expiration.setFullYear(expiration.getFullYear() + 1)

    // Verifica se já existe uma licença para a empresa (ativa ou não)
    const existing = await prisma.license.findFirst({
      where: { companies: { some: { id: dbUser.companyId } } },
      orderBy: { createdAt: 'desc' }
    })

    let license: SerializedLicense

    if (existing) {
      const updated = await prisma.license.update({
        where: { id: existing.id },
        data: {
          status: 'active',
          startDate: now,
          expirationDate: expiration,
          trialEndsAt: null,
          active: true
        }
      })
      license = serializeLicense(updated)
    } else {
      const created = await prisma.license.create({
        data: {
          plan: 'pro',
          status: 'active',
          maxUsers: 50,
          maxBranches: 5,
          maxIndicators: 100,
          startDate: now,
          expirationDate: expiration,
          trialEndsAt: null,
          currency: 'BRL',
          active: true
        }
      })
      license = serializeLicense(created)
    }

    // Vincula a licença à empresa (Company.licenseId)
    await prisma.company.update({
      where: { id: dbUser.companyId },
      data: {
        licenseId: BigInt(license.id),
        plan: 'pro',
        licenseExpiresAt: new Date(license.expirationDate)
      }
    })

    revalidatePath('/licencas')
    revalidatePath('/configuracoes')

    return { data: license, error: null }
  } catch (error: unknown) {
    console.error('Error activating license:', error)
    const message = error instanceof Error ? error.message : 'Erro ao ativar a licença'
    return { data: null, error: message }
  }
}

export async function renewLicenseAction(licenseId: string): Promise<{ data: SerializedLicense | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) return { data: null, error: 'Usuário não encontrado' }

  try {
    const current = await prisma.license.findFirst({
      where: {
        id: BigInt(licenseId),
        companies: { some: { id: dbUser.companyId } }
      }
    })

    if (!current) return { data: null, error: 'Licença não encontrada' }

    const base = current.expirationDate && current.expirationDate > new Date()
      ? current.expirationDate
      : new Date()
    const newExpiration = new Date(base)
    newExpiration.setFullYear(newExpiration.getFullYear() + 1)

    const updated = await prisma.license.update({
      where: { id: current.id },
      data: {
        status: 'active',
        expirationDate: newExpiration,
        active: true
      }
    })

    await prisma.company.update({
      where: { id: dbUser.companyId },
      data: { licenseExpiresAt: newExpiration }
    })

    revalidatePath('/licencas')
    revalidatePath('/configuracoes')

    return { data: serializeLicense(updated), error: null }
  } catch (error: unknown) {
    console.error('Error renewing license:', error)
    const message = error instanceof Error ? error.message : 'Erro ao renovar a licença'
    return { data: null, error: message }
  }
}

export async function revokeLicenseAction(licenseId: string): Promise<{ data: SerializedLicense | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) return { data: null, error: 'Usuário não encontrado' }

  try {
    const current = await prisma.license.findFirst({
      where: {
        id: BigInt(licenseId),
        companies: { some: { id: dbUser.companyId } }
      }
    })

    if (!current) return { data: null, error: 'Licença não encontrada' }

    const updated = await prisma.license.update({
      where: { id: current.id },
      data: {
        status: 'expired',
        active: false
      }
    })

    revalidatePath('/licencas')
    revalidatePath('/configuracoes')

    return { data: serializeLicense(updated), error: null }
  } catch (error: unknown) {
    console.error('Error revoking license:', error)
    const message = error instanceof Error ? error.message : 'Erro ao revogar a licença'
    return { data: null, error: message }
  }
}

export interface LicenseLimitsInput {
  maxUsers?: number
  maxBranches?: number
  maxIndicators?: number
}

export async function updateLicenseLimitsAction(
  licenseId: string,
  limits: LicenseLimitsInput
): Promise<{ data: SerializedLicense | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) return { data: null, error: 'Usuário não encontrado' }

  try {
    const current = await prisma.license.findFirst({
      where: {
        id: BigInt(licenseId),
        companies: { some: { id: dbUser.companyId } }
      }
    })

    if (!current) return { data: null, error: 'Licença não encontrada' }

    const data: {
      maxUsers?: number
      maxBranches?: number
      maxIndicators?: number
    } = {}
    if (typeof limits.maxUsers === 'number') data.maxUsers = limits.maxUsers
    if (typeof limits.maxBranches === 'number') data.maxBranches = limits.maxBranches
    if (typeof limits.maxIndicators === 'number') data.maxIndicators = limits.maxIndicators

    const updated = await prisma.license.update({
      where: { id: current.id },
      data
    })

    revalidatePath('/licencas')
    revalidatePath('/configuracoes')

    return { data: serializeLicense(updated), error: null }
  } catch (error: unknown) {
    console.error('Error updating license limits:', error)
    const message = error instanceof Error ? error.message : 'Erro ao atualizar os limites da licença'
    return { data: null, error: message }
  }
}
