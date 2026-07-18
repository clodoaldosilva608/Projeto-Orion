import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const SUPABASE_ID = 'd3b170d7-28cd-403e-a3b9-2a82b13a5948'
const EMAIL = 'clodoaldo608@gmail.com'
const NAME = 'Clodoaldo Silva'
const COMPANY = 'Clodoaldo Silva'

async function main() {
  // evita duplicar se ja existir User com esse supabaseId
  const exist = await prisma.user.findFirst({ where: { supabaseId: SUPABASE_ID } })
  if (exist) {
    console.log('USUARIO JA EXISTE no Orion:', exist.email, '| companyId:', exist.companyId)
    return
  }

  const result = await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        legalName: COMPANY, tradeName: COMPANY, email: EMAIL,
        plan: 'free', onboardingStep: 'company', theme: 'orion-light',
      },
    })
    const branch = await tx.branch.create({
      data: { companyId: company.id, code: 'MATRIZ', name: 'Matriz', isHeadquarters: true, status: 'active' },
    })
    const adminRole = await tx.role.create({
      data: { companyId: company.id, name: 'Administrador', slug: 'admin', description: 'Acesso total', isSystem: true },
    })
    const user = await tx.user.create({
      data: {
        companyId: company.id, branchId: branch.id, roleId: adminRole.id,
        supabaseId: SUPABASE_ID, name: NAME, email: EMAIL, status: 'active',
        emailVerifiedAt: new Date(),
      },
    })
    await tx.branch.update({ where: { id: branch.id }, data: { managerId: user.id } })
    return { company, user }
  })

  console.log('CRIADO: company', result.company.id, '| user', result.user.id, '| email', result.user.email)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error('ERRO', e); prisma.$disconnect(); process.exit(1) })
