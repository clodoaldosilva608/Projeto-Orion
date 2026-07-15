import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { supabaseId, name, email, companyName, cnpj } = body

    if (!supabaseId || !name || !email || !companyName) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não informados' },
        { status: 400 }
      )
    }

    // Cria empresa e usuário admin em transação
    const result = await prisma.$transaction(async (tx) => {
      // 1. Criar empresa
      const company = await tx.company.create({
        data: {
          legalName: companyName,
          tradeName: companyName,
          cnpj: cnpj ?? null,
          email,
          plan: 'free',
          onboardingStep: 'company',
        },
      })

      // 2. Criar filial Matriz padrão
      const branch = await tx.branch.create({
        data: {
          companyId: company.id,
          code: 'MATRIZ',
          name: 'Matriz',
          isHeadquarters: true,
          status: 'active',
        },
      })

      // 3. Criar Role de admin padrão
      const adminRole = await tx.role.create({
        data: {
          companyId: company.id,
          name: 'Administrador',
          slug: 'admin',
          description: 'Acesso total ao sistema',
          isSystem: true,
        },
      })

      // 4. Criar usuário admin
      const user = await tx.user.create({
        data: {
          companyId: company.id,
          branchId: branch.id,
          roleId: adminRole.id,
          supabaseId,
          name,
          email,
          status: 'active',
          emailVerifiedAt: new Date(),
        },
      })

      // 5. Atualizar manager da filial
      await tx.branch.update({
        where: { id: branch.id },
        data: { managerId: user.id },
      })

      return { company, branch, user, adminRole }
    })

    return NextResponse.json(
      {
        data: {
          companyId: result.company.uuid,
          userId: result.user.uuid,
        },
        error: null,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[REGISTER_API]', error)
    return NextResponse.json(
      { error: 'Erro interno ao criar conta' },
      { status: 500 }
    )
  }
}
