import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Seed Orion SaaS...')
  const now = new Date()
  const future = new Date(now.getFullYear(), now.getMonth() + 3, 0)
  const inOneYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())

  // 1. Company
  const company = await prisma.company.upsert({
    where: { uuid: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: { uuid: '00000000-0000-0000-0000-000000000001', legalName: 'Orion Platform LTDA', tradeName: 'Orion', country: 'BR', theme: 'orion-dark', language: 'pt', currency: 'BRL', timezone: 'America/Sao_Paulo', plan: 'enterprise', onboardingCompleted: true },
  })
  console.log('Company OK')

  // 2. Branch
  let branch = await prisma.branch.findFirst({ where: { companyId: company.id, code: 'MATRIZ' } })
  if (!branch) branch = await prisma.branch.create({ data: { companyId: company.id, code: 'MATRIZ', name: 'Matriz', country: 'BR', status: 'active', isHeadquarters: true } })
  console.log('Branch OK')

  // 3. Role
  let adminRole = await prisma.role.findFirst({ where: { companyId: company.id, slug: 'admin' } })
  if (!adminRole) adminRole = await prisma.role.create({ data: { companyId: company.id, name: 'Administrador', slug: 'admin', description: 'Acesso total', isSystem: true } })
  console.log('Role OK')

  // 4. User
  let user = await prisma.user.findFirst({ where: { email: 'clodoaldosilva608@gmail.com' } })
  if (!user) user = await prisma.user.create({ data: { companyId: company.id, branchId: branch.id, roleId: adminRole.id, supabaseId: '87540e8b-d46e-4ac6-8a1b-5c030e320317', name: 'Admin Orion', email: 'clodoaldosilva608@gmail.com', status: 'active', emailVerifiedAt: now, jobTitle: 'Super Administrador', department: 'Direção' } })
  else await prisma.user.update({ where: { id: user.id }, data: { roleId: adminRole.id, status: 'active' } })
  console.log('User OK')

  // 5. Indicator Categories
  const catNames = ['Vendas', 'Financeiro', 'Operacional', 'Pós-Venda']
  const categories = []
  for (const name of catNames) {
    let c = await prisma.indicatorCategory.findFirst({ where: { companyId: company.id, name } })
    if (!c) c = await prisma.indicatorCategory.create({ data: { companyId: company.id, name, description: `Categoria ${name}` } })
    categories.push(c)
  }
  console.log('Categories OK')

  // 6. Indicators
  const indData = [{ name: 'Receita Bruta', unit: 'R$', target: 500000, cat: 0 }, { name: 'Ticket Médio', unit: 'R$', target: 2500, cat: 1 }, { name: 'NPS', unit: 'pontos', target: 80, cat: 3 }, { name: 'Conversão', unit: '%', target: 25, cat: 0 }, { name: 'Churn Rate', unit: '%', target: 5, cat: 2 }, { name: 'Tempo de Resposta', unit: 'horas', target: 4, cat: 3 }]
  const indicators = []
  for (const ind of indData) {
    let i = await prisma.indicator.findFirst({ where: { companyId: company.id, name: ind.name } })
    if (!i) i = await prisma.indicator.create({ data: { companyId: company.id, categoryId: categories[ind.cat].id, name: ind.name, slug: ind.name.toLowerCase().replace(/ /g, "-"), unit: ind.unit } })
    indicators.push(i)
  }
  console.log('Indicators OK')

  // 7. Goals
  const goalData = [{ name: 'Meta de Receita Q1', target: 500000, ind: 0 }, { name: 'Meta de Ticket Médio', target: 2500, ind: 1 }, { name: 'Meta de NPS', target: 80, ind: 2 }, { name: 'Meta de Conversão', target: 25, ind: 3 }, { name: 'Meta de Churn', target: 5, ind: 4 }]
  const goals = []
  for (const g of goalData) {
    let goal = await prisma.goal.findFirst({ where: { companyId: company.id, name: g.name } })
    if (!goal) goal = await prisma.goal.create({ data: { companyId: company.id, indicatorId: indicators[g.ind].id, name: g.name, type: 'monthly', targetValue: g.target, startDate: now, endDate: future, createdBy: user.id } })
    goals.push(goal)
  }
  console.log('Goals OK')

  // 8. Results
  const existingResults = await prisma.result.count({ where: { companyId: company.id } })
  if (existingResults === 0) {
    for (let i = 0; i < goals.length; i++) {
      for (let j = 0; j < 2; j++) {
        const value = Number(goals[i].targetValue) * (0.3 + Math.random() * 0.5)
        await prisma.result.create({ data: { companyId: company.id, goalId: goals[i].id, userId: user.id, value: Math.round(value * 100) / 100, referenceDate: new Date(now.getTime() - j * 86400000), status: j === 0 ? 'approved' : 'pending', createdBy: user.id, ...(j === 0 ? { approvedBy: user.id, approvedAt: now } : {}) } })
      }
    }
  }
  console.log('Results OK')

  // 9. Campaign (skipped)
  console.log('Campaign SKIPPED')

  // 10. Ranking (skipped — model needs different fields)
  console.log('Ranking SKIPPED')

  // 11. Notifications
  if (await prisma.notification.count({ where: { companyId: company.id } }) === 0) {
    for (const n of [{ title: 'Meta atingida!', description: 'Você atingiu 120% da meta', priority: 'high' }, { title: 'Resultados pendentes', description: '3 resultados aguardando aprovação', priority: 'normal' }, { title: 'Campanha ativa', description: 'Campanha Q1 está ativa', priority: 'normal' }]) {
      try { await prisma.notification.create({ data: { companyId: company.id, userId: user.id, title: n.title, body: n.description, priority: n.priority as any, channel: 'in_app' } }) } catch (e) { console.log('Notif skip:', (e as Error).message.substring(0, 50)) }
    }
  }
  console.log('Notifications OK')

  // 12. SystemSettings
  for (const s of [{ key: 'app.name', value: 'Orion' }, { key: 'app.url', value: 'https://orion-platform-black.vercel.app' }, { key: 'app.version', value: '1.0.0' }]) {
    let set = await prisma.systemSetting.findFirst({ where: { key: s.key } })
    if (!set) await prisma.systemSetting.create({ data: { ...s, companyId: company.id } })
  }
  console.log('Settings OK')

  // === SAAS MODELS ===
  // SaasUser
  await prisma.saasUser.upsert({ where: { email: 'clodoaldosilva608@gmail.com' }, update: { role: 'super_admin' }, create: { email: 'clodoaldosilva608@gmail.com', name: 'Admin Orion', role: 'super_admin', supabaseId: '87540e8b-d46e-4ac6-8a1b-5c030e320317' } })
  console.log('SaasUser OK')

  // SaasClients
  const clientData = [{ name: 'FormaPlus LTDA', email: 'contato@formaplus.com.br', company: 'FormaPlus', phone: '+55 11 3000-1001' }, { name: 'BioSaude Clínica', email: 'contato@biosaude.com.br', company: 'BioSaude', phone: '+55 11 3000-1002' }, { name: 'FIManager', email: 'contato@fimanager.com', company: 'FIManager', phone: '+55 11 3000-1003' }, { name: 'MarketPro', email: 'contato@marketpro.com.br', company: 'MarketPro', phone: '+55 11 3000-1004' }, { name: 'LogTrack', email: 'contato@logtrack.com.br', company: 'LogTrack', phone: '+55 11 3000-1005' }]
  const saasClients = []
  for (const c of clientData) {
    let cl = await prisma.saasClient.findUnique({ where: { email: c.email } })
    if (!cl) cl = await prisma.saasClient.create({ data: c })
    saasClients.push(cl)
  }
  console.log('SaasClients OK')

  // SaasProjects
  const projectData = [{ name: 'FormaPlus', status: 'in_development', progress: 65, iconColor: '#60a5fa', clientId: saasClients[0].id }, { name: 'BioSaude', status: 'in_testing', progress: 80, iconColor: '#fbbf24', clientId: saasClients[1].id }, { name: 'FIManager', status: 'planning', progress: 25, iconColor: '#3b82f6', clientId: saasClients[2].id }, { name: 'MarketPro', status: 'homologation', progress: 95, iconColor: '#fb923c', clientId: saasClients[3].id }, { name: 'LogTrack', status: 'waiting_client', progress: 60, iconColor: '#f87171', clientId: saasClients[4].id }]
  const saasProjects = []
  for (const p of projectData) {
    let pr = await prisma.saasProject.findFirst({ where: { name: p.name } })
    if (!pr) pr = await prisma.saasProject.create({ data: p })
    else await prisma.saasProject.update({ where: { id: pr.id }, data: { status: p.status, progress: p.progress } })
    saasProjects.push(pr)
  }
  console.log('SaasProjects OK')

  // SaasApplications
  if (await prisma.saasApplication.count() === 0) {
    for (const p of saasProjects) {
      const count = Math.floor(Math.random() * 3) + 1
      for (let i = 0; i < count; i++) {
        await prisma.saasApplication.create({ data: { name: `${p.name} ${['WEB', 'MOBILE', 'PWA', 'DESKTOP'][i % 4]}`, version: `1.${i}.0`, type: (['web', 'mobile', 'pwa', 'desktop'] as const)[i % 4], status: 'published', projectId: p.id } })
      }
    }
  }
  console.log('SaasApplications OK')

  // SaasPayments
  if (await prisma.saasPayment.count() === 0) {
    for (const p of [{ amountCents: 28500, status: 'approved', method: 'credit_card', description: 'Plano Profissional', clientId: saasClients[0].id }, { amountCents: 49900, status: 'approved', method: 'credit_card', description: 'Plano Enterprise', clientId: saasClients[1].id }, { amountCents: 9900, status: 'approved', method: 'pix', description: 'Plano Starter', clientId: saasClients[2].id }, { amountCents: 29900, status: 'approved', method: 'credit_card', description: 'Plano Pro', clientId: saasClients[3].id }, { amountCents: 49900, status: 'pending', method: 'boleto', description: 'Plano Enterprise', clientId: saasClients[4].id }]) {
      await prisma.saasPayment.create({ data: p })
    }
  }
  console.log('SaasPayments OK')

  // SaasActivities
  if (await prisma.saasActivity.count() === 0) {
    for (const a of [{ type: 'project_created', title: 'Novo projeto criado', description: 'FormaPlus criou projeto FIManager' }, { type: 'payment_approved', title: 'Pagamento aprovado', description: 'R$ 285,00 aprovado — Plano Profissional' }, { type: 'application_published', title: 'Aplicação publicada', description: 'FormaPlus v1.2.3 publicada' }, { type: 'license_renewed', title: 'Licença renovada', description: 'BioSaude renovada' }, { type: 'deploy_performed', title: 'Deploy realizado', description: 'MarketPro em produção' }, { type: 'user_invited', title: 'Usuário convidado', description: 'Novo dev para LogTrack' }, { type: 'ticket_opened', title: 'Novo chamado', description: 'Chamado #1238 — FormaPlus' }]) {
      await prisma.saasActivity.create({ data: a })
    }
  }
  console.log('SaasActivities OK')

  // SaasAlerts
  if (await prisma.saasAlert.count() === 0) {
    for (const a of [{ severity: 'critical', title: 'Uso de IA acima do limite', description: 'Consumo ultrapassou 90%' }, { severity: 'warning', title: 'Projeto atrasado', description: 'LogTrack 2 dias atrasado' }, { severity: 'warning', title: 'Backup não executado', description: 'Backup diário não executado' }, { severity: 'info', title: 'Sistema instável', description: 'Latência alta em staging' }, { severity: 'info', title: 'Novo chamado', description: 'Chamado #1238 — FormaPlus' }]) {
      await prisma.saasAlert.create({ data: a })
    }
  }
  console.log('SaasAlerts OK')

  // SaasServices
  for (const name of ['API Gateway', 'Banco de Dados', 'Redis', 'Fila de Jobs', 'Storage', 'Serviços de IA', 'E-mail Service', 'Backup']) {
    let s = await prisma.saasService.findUnique({ where: { name } })
    if (!s) await prisma.saasService.create({ data: { name, status: 'operational', uptime: 100 } })
  }
  console.log('SaasServices OK')

  // Product
  let product = await prisma.product.findUnique({ where: { slug: 'projeto-paguemenos' } })
  if (!product) product = await prisma.product.create({ data: { name: 'PagueMenos - Gestão Comercial', slug: 'projeto-paguemenos', description: 'Plataforma de gestão comercial com IA', repoUrl: 'https://github.com/clodoaldosilva608/Projeto-Orion.git', demoUrl: 'https://projeto-paguemenos.vercel.app', category: 'gestao_comercial', priceCents: 29900, status: 'active', features: ['Metas e Indicadores', 'Ranking Gamificado', 'Campanhas', 'Workflow de Aprovação', 'IA Integrada', 'PWA Instalável'], iconColor: '#DC2626' } })
  console.log('Product OK')

  // SaasDeployments
  if (await prisma.saasDeployment.count() === 0) {
    await prisma.saasDeployment.create({ data: { url: 'https://projeto-paguemenos.vercel.app', status: 'deployed', productId: product.id, clientId: saasClients[0].id, deployedAt: now } })
    await prisma.saasDeployment.create({ data: { url: null, status: 'pending', productId: product.id, clientId: saasClients[1].id } })
  }
  console.log('SaasDeployments OK')

  // SaasLicenses
  if (await prisma.saasLicense.count() === 0) {
    const plans = ['free', 'starter', 'pro', 'enterprise'] as const
    for (let i = 0; i < saasClients.length; i++) {
      await prisma.saasLicense.create({ data: { key: `ORION-${saasClients[i].name.substring(0, 4).toUpperCase()}-${i}`, plan: plans[i % 4], status: 'active', maxUsers: [5, 15, 50, 500][i % 4], maxApplications: [3, 5, 15, 100][i % 4], priceCents: [0, 9900, 29900, 49900][i % 4], startDate: now, expirationDate: inOneYear, clientId: saasClients[i].id } })
    }
  }
  console.log('SaasLicenses OK')

  console.log('\n✅ Seed completo!')
}
main().catch((e) => { console.error('❌', e); process.exit(1) }).finally(() => prisma.$disconnect())
