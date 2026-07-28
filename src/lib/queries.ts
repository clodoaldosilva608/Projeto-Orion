import { prisma } from './db'

async function withTimeout<T>(p: Promise<T>, ms = 8000, f: T): Promise<T> {
  try { return await Promise.race([p, new Promise<T>(r => setTimeout(() => r(f), ms))]) } catch { return f }
}

export async function getDashboardData() {
  const [
    clientsCount, projectsCount, appsCount, licensesCount,
    payments, projects, apps, services, activities, alerts,
    appTypes, deployments, clients
  ] = await Promise.all([
    withTimeout(prisma.saasClient.count(), 8000, 0),
    withTimeout(prisma.saasProject.count(), 8000, 0),
    withTimeout(prisma.saasApplication.count(), 8000, 0),
    withTimeout(prisma.saasLicense.count({ where: { status: 'active' } }), 8000, 0),
    withTimeout(prisma.saasPayment.aggregate({ where: { status: 'approved' }, _sum: { amountCents: true } }), 8000, { _sum: { amountCents: 0 } }),
    withTimeout(prisma.saasProject.findMany({ take: 5, orderBy: { updatedAt: 'desc' } }), 8000, []),
    withTimeout(prisma.saasApplication.findMany(), 8000, []),
    withTimeout(prisma.saasService.findMany(), 8000, []),
    withTimeout(prisma.saasActivity.findMany({ take: 7, orderBy: { createdAt: 'desc' } }), 8000, []),
    withTimeout(prisma.saasAlert.findMany({ take: 5, orderBy: { createdAt: 'desc' } }), 8000, []),
    withTimeout(prisma.saasApplication.groupBy({ by: ['type'], _count: true }), 8000, []),
    withTimeout(prisma.saasDeployment.findMany({ include: { product: true } }), 8000, []),
    withTimeout(prisma.saasClient.findMany(), 8000, []),
  ])

  const clientMap: Record<string, string> = {}
  for (const c of clients) { clientMap[c.id] = c.company || c.name }

  const mrr = (payments as any)?._sum?.amountCents ? Number((payments as any)._sum.amountCents) / 100 : 0

  // Revenue chart (12 months — mock baseado no MRR real)
  const baseRevenue = mrr * 0.5
  const revenue = []
  const months = ['Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai']
  for (let i = 0; i < 12; i++) {
    const progress = i / 11
    const value = baseRevenue + (mrr - baseRevenue) * progress * (0.9 + Math.random() * 0.2)
    revenue.push({ month: months[i], value: Math.round(value) })
  }

  // Projects by status
  const statusCounts: Record<string, number> = {}
  for (const p of projects) { statusCounts[p.status] = (statusCounts[p.status] ?? 0) + 1 }
  const statusColors: Record<string, string> = { planning: '#3b82f6', in_development: '#60a5fa', in_testing: '#fbbf24', homologation: '#fb923c', waiting_client: '#f87171', completed: '#10b981', canceled: '#6b7280' }
  const statusLabels: Record<string, string> = { planning: 'Planejamento', in_development: 'Em Desenvolvimento', in_testing: 'Em Testes', homologation: 'Homologação', waiting_client: 'Aguardando Cliente', completed: 'Concluídos', canceled: 'Cancelados' }
  const totalProjects = projects.length || 1
  const projectsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
    label: statusLabels[status] ?? status, value: count, percent: Math.round((count / totalProjects) * 100), color: statusColors[status] ?? '#6b7280'
  }))

  // App distribution
  const appTypeLabels: Record<string, string> = { web: 'Web Apps', mobile: 'Mobile Apps', pwa: 'PWA', desktop: 'Desktop Apps' }
  const totalApps = apps.length || 1
  const appDistribution = (appTypes as any[]).map((t) => ({
    label: appTypeLabels[t.type] ?? t.type, count: t._count, percent: Math.round((t._count / totalApps) * 100)
  }))

  // AI usage (mock — 14 days)
  const aiUsageByDay = []
  for (let i = 14; i >= 1; i--) {
    const base = 12000 + (14 - i) * 800
    aiUsageByDay.push({ day: String(i).padStart(2, '0'), value: Math.round(base + Math.random() * 3000) })
  }
  const aiUsageTotal = aiUsageByDay.reduce((acc, d) => acc + d.value, 0)

  // Resources (mock)
  const resources = [
    { label: 'CPU', percent: 48, status: 'ok' as const },
    { label: 'Memória', percent: 82, status: 'warning' as const },
    { label: 'Storage', percent: 38, status: 'ok' as const },
    { label: 'Banco de Dados', percent: 71, status: 'critical' as const },
  ]

  return {
    kpis: {
      clients: { value: clientsCount, change: '+12,3%' },
      projects: { value: projectsCount, change: '+8,7%' },
      applications: { value: appsCount, change: '+15,2%' },
      licenses: { value: licensesCount, change: '+10,2%' },
      mrr: { value: mrr, change: '+18,6%' },
      aiUsage: { value: aiUsageTotal, change: '+22,4%' },
    },
    revenue, projectsByStatus,
    systemServices: services.map(s => ({ id: s.id, name: s.name, status: s.status, uptime: s.uptime })),
    recentProjects: projects.map(p => ({ id: p.id, name: p.name, client: clientMap[p.clientId ?? ''] ?? '', status: p.status, progress: p.progress, iconColor: p.iconColor, createdAt: p.createdAt.toISOString() })),
    activities: activities.map(a => ({ id: a.id, type: a.type, title: a.title, description: a.description, createdAt: a.createdAt.toISOString() })),
    alerts: alerts.map(a => ({ id: a.id, severity: a.severity, title: a.title, description: a.description, createdAt: a.createdAt.toISOString() })),
    aiUsage: aiUsageByDay,
    appDistribution,
    resources,
    deployments: deployments.map(d => ({ id: d.id, url: d.url, status: d.status, product: d.product?.name ?? '', deployedAt: d.deployedAt?.toISOString() ?? null })),
  }
}

// ================================================================
// DASHBOARD TENANT — dados filtrados por empresa (usuário comum)
// Retorna apenas dados da empresa do usuário logado, NÃO dados
// globais da plataforma.
// ================================================================
export async function getDashboardDataTenant(companyId: bigint) {
  const [
    usersCount, branchesCount, indicatorsCount, goalsCount,
    results, campaigns, enabledModules, softwareProjects,
    softwareLicenses, company, branch,
  ] = await Promise.all([
    withTimeout(prisma.user.count({ where: { companyId, deletedAt: null } }), 8000, 0),
    withTimeout(prisma.branch.count({ where: { companyId } }), 8000, 0),
    withTimeout(prisma.indicator.count({ where: { companyId, deletedAt: null } }), 8000, 0),
    withTimeout(prisma.goal.count({ where: { companyId, deletedAt: null } }), 8000, 0),
    withTimeout(prisma.result.findMany({ where: { companyId }, take: 30, orderBy: { referenceDate: 'desc' }, include: { goal: { select: { name: true, targetValue: true } } } }), 8000, []),
    withTimeout(prisma.campaign.findMany({ where: { companyId, deletedAt: null }, take: 5, orderBy: { createdAt: 'desc' } }), 8000, []),
    withTimeout(prisma.enabledModule.findMany({ where: { companyId, enabled: true }, select: { moduleKey: true } }), 8000, []),
    withTimeout(prisma.softwareProject.findMany({ where: { companyId, deletedAt: null }, take: 5, orderBy: { updatedAt: 'desc' } }), 8000, []),
    withTimeout(prisma.softwareLicense.findMany({ where: { companyId }, take: 5, orderBy: { createdAt: 'desc' } }), 8000, []),
    withTimeout(prisma.company.findUnique({ where: { id: companyId }, select: { tradeName: true, plan: true, primaryColor: true, trialEndsAt: true, licenseExpiresAt: true, license: { select: { status: true, trialEndsAt: true, expirationDate: true } } } }), 8000, null),
    withTimeout(prisma.branch.findFirst({ where: { companyId, isHeadquarters: true }, select: { name: true, city: true, state: true } }), 8000, null),
  ])

  // Calcular progresso de metas (últimos 30 dias)
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const recentResults = results.filter(r => r.referenceDate > thirtyDaysAgo)
  const totalResultsValue = recentResults.reduce((sum, r) => sum + Number(r.value), 0)
  const goalsAchieved = recentResults.filter(r => r.goal && Number(r.value) >= Number(r.goal.targetValue)).length

  // Trial info
  const license = company?.license
  let trialDaysLeft = 0
  let trialStatus: 'trial' | 'active' | 'expired' | 'none' = 'none'
  if (license) {
    if (license.status === 'trial' && license.trialEndsAt) {
      trialDaysLeft = Math.max(0, Math.ceil((license.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      trialStatus = trialDaysLeft > 0 ? 'trial' : 'expired'
    } else if (license.status === 'active') {
      trialStatus = 'active'
    }
  }

  // Módulos habilitados (produtos que o cliente assinou)
  const subscribedModules = enabledModules.map(m => m.moduleKey)

  // Revenue chart — baseado em resultados reais do tenant
  const revenue: { month: string; value: number }[] = []
  const months = ['Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai']
  const baseValue = totalResultsValue > 0 ? totalResultsValue / 12 : 5000
  for (let i = 0; i < 12; i++) {
    revenue.push({ month: months[i], value: Math.round(baseValue * (0.7 + Math.random() * 0.6)) })
  }

  // Projects by status (dos softwareProjects do tenant)
  const statusCounts: Record<string, number> = {}
  for (const p of softwareProjects) { statusCounts[p.status] = (statusCounts[p.status] ?? 0) + 1 }
  const statusColors: Record<string, string> = { planning: '#3b82f6', in_development: '#60a5fa', in_testing: '#fbbf24', homologation: '#fb923c', waiting_client: '#f87171', completed: '#10b981', canceled: '#6b7280' }
  const statusLabels: Record<string, string> = { planning: 'Planejamento', in_development: 'Em Desenvolvimento', in_testing: 'Em Testes', homologation: 'Homologação', waiting_client: 'Aguardando', completed: 'Concluídos', canceled: 'Cancelados' }
  const totalSw = softwareProjects.length || 1
  const projectsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
    label: statusLabels[status] ?? status, value: count, percent: Math.round((count / totalSw) * 100), color: statusColors[status] ?? '#6b7280'
  }))

  // AI usage (14 dias — mock baseado no plano)
  const aiUsageByDay: { day: string; value: number }[] = []
  for (let i = 14; i >= 1; i--) {
    aiUsageByDay.push({ day: String(i).padStart(2, '0'), value: Math.round(500 + Math.random() * 2000) })
  }
  const aiUsageTotal = aiUsageByDay.reduce((acc, d) => acc + d.value, 0)

  return {
    kpis: {
      users: { value: usersCount, change: 'Equipe' },
      branches: { value: branchesCount, change: 'Filiais' },
      indicators: { value: indicatorsCount, change: 'Indicadores' },
      goals: { value: goalsCount, change: 'Metas' },
      goalsAchieved: { value: goalsAchieved, change: 'Atingidas' },
      results: { value: recentResults.length, change: 'Resultados 30d' },
    },
    revenue,
    projectsByStatus: projectsByStatus.length > 0 ? projectsByStatus : [{ label: 'Nenhum projeto', value: 0, percent: 0, color: '#6b7280' }],
    systemServices: [
      { id: '1', name: 'Plataforma Orion', status: 'operational', uptime: 100 },
      { id: '2', name: 'Banco de Dados', status: 'operational', uptime: 99.9 },
      { id: '3', name: 'API', status: 'operational', uptime: 99.8 },
    ],
    recentProjects: softwareProjects.map(p => ({
      id: p.id.toString(), name: p.name, client: company?.tradeName ?? '', status: p.status, progress: 0, iconColor: '#8b5cf6', createdAt: p.createdAt.toISOString()
    })),
    activities: campaigns.map(c => ({
      id: c.id.toString(), type: 'campaign', title: c.name, description: c.description ?? '', createdAt: c.createdAt.toISOString()
    })),
    alerts: trialStatus === 'trial' && trialDaysLeft <= 3
      ? [{ id: '1', severity: 'warning', title: 'Trial expira em breve', description: `Faltam ${trialDaysLeft} dias`, createdAt: now.toISOString() }]
      : trialStatus === 'expired'
      ? [{ id: '1', severity: 'critical', title: 'Trial expirado', description: 'Assine um plano para continuar', createdAt: now.toISOString() }]
      : [],
    aiUsage: aiUsageByDay,
    appDistribution: [{ label: 'Web', count: 1, percent: 100 }],
    resources: [
      { label: 'Usuários', percent: Math.min(100, (usersCount / 50) * 100), status: usersCount > 40 ? 'warning' as const : 'ok' as const },
      { label: 'Armazenamento', percent: 35, status: 'ok' as const },
      { label: 'API Calls', percent: 42, status: 'ok' as const },
    ],
    deployments: softwareLicenses.map(sl => ({
      id: sl.id.toString(), url: null, status: sl.status, product: sl.plan ?? 'Licença', deployedAt: sl.createdAt.toISOString()
    })),
    // Dados extras para tenant
    company: company ? {
      tradeName: company.tradeName,
      plan: company.plan,
      primaryColor: company.primaryColor,
      trialDaysLeft,
      trialStatus,
    } : null,
    subscribedModules,
  }
}
