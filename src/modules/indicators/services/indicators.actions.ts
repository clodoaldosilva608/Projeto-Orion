'use server'

import { prisma } from '@/shared/lib/prisma'
import { createClient } from '@/shared/lib/supabase-server'
import { revalidatePath } from 'next/cache'

// ================================================================
// INDICADORES - SERVER ACTIONS
// ================================================================

// ---------- LISTAGEM ----------

export async function listCategoriesAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado', data: null }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) return { error: 'Usuário não encontrado', data: null }

  try {
    const categories = await prisma.indicatorCategory.findMany({
      where: {
        companyId: dbUser.companyId,
        active: true
      },
      orderBy: { sortOrder: 'asc' }
    })

    const serialized = categories.map(cat => ({
      ...cat,
      id: cat.id.toString(),
      companyId: cat.companyId.toString()
    }))

    return { data: serialized, error: null }
  } catch (error: any) {
    console.error('Error listing categories:', error)
    return { error: 'Erro ao buscar categorias', data: null }
  }
}

export async function listIndicatorsAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado', data: null }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) return { error: 'Usuário não encontrado', data: null }

  try {
    const indicators = await prisma.indicator.findMany({
      where: {
        companyId: dbUser.companyId,
        active: true
      },
      include: {
        category: true
      },
      orderBy: { sortOrder: 'asc' }
    })

    const serialized = indicators.map(ind => ({
      ...ind,
      id: ind.id.toString(),
      companyId: ind.companyId.toString(),
      categoryId: ind.categoryId ? ind.categoryId.toString() : null,
      createdBy: ind.createdBy?.toString(),
      updatedBy: ind.updatedBy?.toString(),
      category: ind.category
        ? {
            ...ind.category,
            id: ind.category.id.toString(),
            companyId: ind.category.companyId.toString()
          }
        : null
    }))

    return { data: serialized, error: null }
  } catch (error: any) {
    console.error('Error listing indicators:', error)
    return { error: 'Erro ao buscar indicadores', data: null }
  }
}

// ---------- HELPER: SLUG ----------

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '')
}

// ---------- CRIAÇÃO ----------

export async function createIndicatorAction(data: {
  name: string
  description?: string
  unit?: string
  formula?: string
  direction?: string
  color?: string
  icon?: string
  categoryId?: string
  allowManual?: boolean
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) return { error: 'Usuário não encontrado' }

  try {
    const baseSlug = slugify(data.name) || 'indicador'
    let slug = baseSlug
    let suffix = 1

    // Garante slug único por company
    while (true) {
      const existing = await prisma.indicator.findUnique({
        where: {
          companyId_slug: {
            companyId: dbUser.companyId,
            slug
          }
        }
      })
      if (!existing) break
      suffix += 1
      slug = `${baseSlug}-${suffix}`
    }

    const indicator = await prisma.indicator.create({
      data: {
        companyId: dbUser.companyId,
        categoryId: data.categoryId ? BigInt(data.categoryId) : null,
        name: data.name,
        slug,
        description: data.description,
        unit: data.unit,
        formula: data.formula,
        direction: data.direction || 'higher_is_better',
        color: data.color,
        icon: data.icon,
        allowManual: data.allowManual ?? true,
        createdBy: dbUser.id
      }
    })

    revalidatePath('/indicadores')

    return {
      data: {
        ...indicator,
        id: indicator.id.toString(),
        companyId: indicator.companyId.toString(),
        categoryId: indicator.categoryId?.toString(),
        createdBy: indicator.createdBy?.toString(),
        updatedBy: indicator.updatedBy?.toString()
      },
      error: null
    }
  } catch (error: any) {
    console.error('Error creating indicator:', error)
    return { error: error.message || 'Erro ao criar o indicador' }
  }
}

export async function createCategoryAction(data: {
  name: string
  description?: string
  color?: string
  icon?: string
  sortOrder?: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) return { error: 'Usuário não encontrado' }

  try {
    const category = await prisma.indicatorCategory.create({
      data: {
        companyId: dbUser.companyId,
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        sortOrder: data.sortOrder ?? 0
      }
    })

    revalidatePath('/indicadores')

    return {
      data: {
        ...category,
        id: category.id.toString(),
        companyId: category.companyId.toString()
      },
      error: null
    }
  } catch (error: any) {
    console.error('Error creating category:', error)
    return { error: error.message || 'Erro ao criar a categoria' }
  }
}

// ---------- ATUALIZAÇÃO ----------

export async function updateIndicatorAction(
  id: string,
  data: {
    name?: string
    description?: string
    unit?: string
    formula?: string
    direction?: string
    color?: string
    icon?: string
    categoryId?: string
    allowManual?: boolean
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) return { error: 'Usuário não encontrado' }

  try {
    const indicator = await prisma.indicator.update({
      where: {
        id: BigInt(id),
        companyId: dbUser.companyId
      },
      data: {
        name: data.name,
        description: data.description,
        unit: data.unit,
        formula: data.formula,
        direction: data.direction,
        color: data.color,
        icon: data.icon,
        categoryId: data.categoryId !== undefined
          ? (data.categoryId ? BigInt(data.categoryId) : null)
          : undefined,
        allowManual: data.allowManual
      }
    })

    revalidatePath('/indicadores')

    return {
      data: {
        ...indicator,
        id: indicator.id.toString(),
        companyId: indicator.companyId.toString(),
        categoryId: indicator.categoryId?.toString(),
        createdBy: indicator.createdBy?.toString(),
        updatedBy: indicator.updatedBy?.toString()
      },
      error: null
    }
  } catch (error: any) {
    console.error('Error updating indicator:', error)
    return { error: error.message || 'Erro ao atualizar o indicador' }
  }
}

// ---------- EXCLUSÃO (SOFT DELETE) ----------

export async function deleteIndicatorAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) return { error: 'Usuário não encontrado' }

  try {
    await prisma.indicator.update({
      where: {
        id: BigInt(id),
        companyId: dbUser.companyId
      },
      data: {
        active: false,
        deletedAt: new Date()
      }
    })

    revalidatePath('/indicadores')

    return { error: null }
  } catch (error: any) {
    console.error('Error deleting indicator:', error)
    return { error: 'Erro ao deletar o indicador' }
  }
}

export async function deleteCategoryAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) return { error: 'Usuário não encontrado' }

  try {
    await prisma.indicatorCategory.update({
      where: {
        id: BigInt(id),
        companyId: dbUser.companyId
      },
      data: {
        active: false,
        deletedAt: new Date()
      }
    })

    revalidatePath('/indicadores')

    return { error: null }
  } catch (error: any) {
    console.error('Error deleting category:', error)
    return { error: 'Erro ao deletar a categoria' }
  }
}
