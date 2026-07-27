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
