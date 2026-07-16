'use server'

import { prisma } from '@/shared/lib/prisma'
import { createClient } from '@/shared/lib/supabase-server'
import { createAdminClient } from '@/shared/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export async function listUsersAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado', data: null }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  if (!dbUser) return { error: 'Usuário não encontrado', data: null }

  try {
    const users = await prisma.user.findMany({
      where: {
        companyId: dbUser.companyId,
        active: true,
      },
      include: {
        role: { select: { name: true, slug: true } },
        branch: { select: { name: true } },
      },
      orderBy: { name: 'asc' }
    })

    const serialized = users.map(u => ({
      id: u.id.toString(),
      name: u.name,
      email: u.email,
      status: u.status,
      jobTitle: u.jobTitle,
      department: u.department,
      avatarUrl: u.avatarUrl,
      createdAt: u.createdAt.toISOString(),
      lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
      role: u.role ? { name: u.role.name, slug: u.role.slug } : null,
      branch: u.branch ? { name: u.branch.name } : null,
      isCurrentUser: u.supabaseId === user.id,
    }))

    return { data: serialized, error: null }
  } catch (error: any) {
    console.error('Error listing users:', error)
    return { error: 'Erro ao buscar usuários', data: null }
  }
}

export async function inviteUserAction(data: {
  email: string
  name: string
  jobTitle?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: { company: true }
  })

  if (!dbUser) return { error: 'Usuário não encontrado' }

  try {
    // Cria o convite via Supabase Admin (o usuário receberá um e-mail com link de confirmação)
    const adminClient = createAdminClient()
    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
      data.email,
      {
        data: {
          name: data.name,
          company_id: dbUser.companyId.toString(),
          company_name: dbUser.company.tradeName,
        },
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      }
    )

    if (inviteError) {
      console.error('Supabase invite error:', inviteError)
      return { error: inviteError.message }
    }

    // Cria o usuário no banco como "invited"
    const existingUser = await prisma.user.findFirst({
      where: { email: data.email, companyId: dbUser.companyId }
    })

    if (!existingUser) {
      await prisma.user.create({
        data: {
          companyId: dbUser.companyId,
          supabaseId: inviteData.user?.id ?? null,
          name: data.name,
          email: data.email,
          jobTitle: data.jobTitle,
          status: 'invited',
          createdBy: dbUser.id,
        }
      })
    }

    revalidatePath('/equipe')
    return { error: null }
  } catch (error: any) {
    console.error('Error inviting user:', error)
    return { error: error.message || 'Erro ao enviar convite' }
  }
}

export async function updateUserStatusAction(userId: string, status: 'active' | 'suspended' | 'inactive') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
  if (!dbUser) return { error: 'Usuário não encontrado' }

  try {
    await prisma.user.update({
      where: { id: BigInt(userId), companyId: dbUser.companyId },
      data: { status, updatedBy: dbUser.id }
    })

    revalidatePath('/equipe')
    return { error: null }
  } catch (error: any) {
    return { error: error.message || 'Erro ao atualizar status' }
  }
}
