/**
 * Serviços de dados do Orion SaaS Platform
 * Busca dados do Customer Dashboard e Admin Central de Comando
 *
 * Alinhado com:
 *  - Doc 06: Logical Database Model
 *  - Doc 08: Use Case Specification
 *  - Doc 09: UX/UI Design System
 *  - Doc 10: API Specification
 */
import { db } from '@/lib/db'

export type DashboardData = {
  customer: {
    id: string
    name: string
    email: string
    company: string | null
    niche: string | null
    phone: string | null
    status: string
    mfaEnabled: boolean
    lastLogin: Date | null
  }
  applications: Array<{
    id: string
    name: string
    description: string | null
    version: string
    status: string
    complexity: string
    niche: string | null
    objective: string | null
    features: string[]
    publishedAt: Date | null
    updatedAt: Date
    artifactSize: number | null
    artifactHash: string | null
  }>
  appUpdates: Array<{
    id: string
    applicationId: string
    applicationName: string
    version: string
    type: string
    changelog: string
    status: string
    createdAt: Date
    publishedAt: Date | null
  }>
  licenses: Array<{
    id: string
    licenseKey: string
    plan: string
    status: string
    duration: number
    maxUsers: number
    maxDevices: number
    maxApps: number
    storageMb: number
    price: number
    currency: string
    autoRenew: boolean
    startDate: Date | null
    endDate: Date | null
    trialEndsAt: Date | null
    applicationName: string | null
  }>
  downloads: Array<{
    id: string
    downloadToken: string
    status: string
    deviceInfo: string | null
    ipAddress: string | null
    downloadedAt: Date | null
    expiresAt: Date
    applicationName: string
  }>
  payments: Array<{
    id: string
    amount: number
    method: string
    status: string
    description: string | null
    invoiceUrl: string | null
    paidAt: Date | null
    createdAt: Date
  }>
  tickets: Array<{
    id: string
    subject: string
    priority: string
    status: string
    category: string
    createdAt: Date
    resolvedAt: Date | null
    messageCount: number
  }>
  notifications: Array<{
    id: string
    title: string
    message: string
    type: string
    priority: string
    read: boolean
    createdAt: Date
  }>
  activity: Array<{
    id: string
    action: string
    entity: string
    ipAddress: string | null
    createdAt: Date
  }>
  trial: { isActive: boolean; daysLeft: number; endsAt: Date | null } | null
  auditLogs: Array<{
    id: string
    action: string
    entity: string
    entityId: string | null
    ipAddress: string | null
    userAgent: string | null
    createdAt: Date
  }>
  stats: {
    totalApps: number
    publishedApps: number
    activeLicenses: number
    trialLicenses: number
    expiringLicenses: number // ativas que expiram em <= 30 dias
    totalPaid: number
    pendingPayments: number
    openTickets: number
    unreadNotifications: number
    storageUsedMb: number // soma dos artefatos publicados
    storageQuotaMb: number // soma da cota das licenças ativas
    pendingUpdates: number
  }
}

const DAY_MS = 24 * 60 * 60 * 1000

function parseFeatures(raw: string | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

export async function getDashboardData(): Promise<DashboardData> {
  // Primeiro cliente ativo (mock de "cliente logado")
  const customer = await db.customer.findFirst({
    where: { status: 'active', deletedAt: null },
    orderBy: { createdAt: 'asc' },
  })

  if (!customer) {
    throw new Error('Nenhum cliente ativo encontrado')
  }

  // Buscar todos os dados do cliente
  const [applications, licenses, downloads, payments, tickets, notifications, activity, auditLogs] =
    await Promise.all([
      db.application.findMany({
        where: { customerId: customer.id, deletedAt: null },
        include: { updates: { orderBy: { createdAt: 'desc' } } },
        orderBy: { updatedAt: 'desc' },
      }),
      db.license.findMany({
        where: { customerId: customer.id },
        include: { application: true },
        orderBy: { createdAt: 'desc' },
      }),
      db.download.findMany({
        where: { customerId: customer.id },
        include: { application: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      db.payment.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      db.supportTicket.findMany({
        where: { customerId: customer.id },
        include: { _count: { select: { messages: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      db.notification.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      db.auditLog.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      db.auditLog.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
    ])

  // Achatar as atualizações (AppUpdate) de todas as aplicações
  const appUpdates = applications
    .flatMap((a) =>
      a.updates.map((u) => ({
        id: u.id,
        applicationId: a.id,
        applicationName: a.name,
        version: u.version,
        type: u.type,
        changelog: u.changelog,
        status: u.status,
        createdAt: u.createdAt,
        publishedAt: u.publishedAt,
      }))
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  const now = Date.now()

  // Estatísticas
  const totalPaid = payments
    .filter((p) => p.status === 'succeeded')
    .reduce((sum, p) => sum + p.amount, 0)

  const activeLicenses = licenses.filter((l) => l.status === 'active')

  const stats = {
    totalApps: applications.length,
    publishedApps: applications.filter((a) => a.status === 'published').length,
    activeLicenses: activeLicenses.length,
    trialLicenses: licenses.filter((l) => l.plan === 'trial').length,
    expiringLicenses: activeLicenses.filter(
      (l) => l.endDate && l.endDate.getTime() - now <= 30 * DAY_MS && l.endDate.getTime() >= now
    ).length,
    totalPaid,
    pendingPayments: payments.filter((p) => p.status === 'pending' || p.status === 'failed').length,
    openTickets: tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length,
    unreadNotifications: notifications.filter((n) => !n.read).length,
    storageUsedMb: Math.round(
      applications
        .filter((a) => a.status === 'published' && a.artifactSize)
        .reduce((sum, a) => sum + (a.artifactSize || 0), 0) /
        (1024 * 1024)
    ),
    storageQuotaMb: activeLicenses.reduce((sum, l) => sum + l.storageMb, 0),
    pendingUpdates: appUpdates.filter((u) => u.status === 'pending').length,
  }

  const trialLicense = licenses.find((l) => l.plan === 'trial' && l.status === 'active')
  const trial = trialLicense
    ? {
        isActive: true,
        daysLeft: trialLicense.trialEndsAt
          ? Math.max(0, Math.ceil((trialLicense.trialEndsAt.getTime() - now) / DAY_MS))
          : 0,
        endsAt: trialLicense.trialEndsAt,
      }
    : null

  return {
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      company: customer.company,
      niche: customer.niche,
      phone: customer.phone,
      status: customer.status,
      mfaEnabled: customer.mfaEnabled,
      lastLogin: customer.lastLogin,
    },
    trial,
    applications: applications.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      version: a.version,
      status: a.status,
      complexity: a.complexity,
      niche: a.niche,
      objective: a.objective,
      features: parseFeatures(a.features),
      publishedAt: a.publishedAt,
      updatedAt: a.updatedAt,
      artifactSize: a.artifactSize,
      artifactHash: a.artifactHash,
    })),
    appUpdates,
    licenses: licenses.map((l) => ({
      id: l.id,
      licenseKey: l.licenseKey,
      plan: l.plan,
      status: l.status,
      duration: l.duration,
      maxUsers: l.maxUsers,
      maxDevices: l.maxDevices,
      maxApps: l.maxApps,
      storageMb: l.storageMb,
      price: l.price,
      currency: l.currency,
      autoRenew: l.autoRenew,
      startDate: l.startDate,
      endDate: l.endDate,
      trialEndsAt: l.trialEndsAt,
      applicationName: l.application?.name || null,
    })),
    downloads: downloads.map((d) => ({
      id: d.id,
      downloadToken: d.downloadToken,
      status: d.status,
      deviceInfo: d.deviceInfo,
      ipAddress: d.ipAddress,
      downloadedAt: d.downloadedAt,
      expiresAt: d.expiresAt,
      applicationName: d.application.name,
    })),
    payments: payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      method: p.method,
      status: p.status,
      description: p.description,
      invoiceUrl: p.invoiceUrl,
      paidAt: p.paidAt,
      createdAt: p.createdAt,
    })),
    tickets: tickets.map((t) => ({
      id: t.id,
      subject: t.subject,
      priority: t.priority,
      status: t.status,
      category: t.category,
      createdAt: t.createdAt,
      resolvedAt: t.resolvedAt,
      messageCount: t._count.messages,
    })),
    notifications: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      priority: n.priority,
      read: n.read,
      createdAt: n.createdAt,
    })),
    activity: activity.map((a) => ({
      id: a.id,
      action: a.action,
      entity: a.entity,
      ipAddress: a.ipAddress,
      createdAt: a.createdAt,
    })),
    auditLogs: auditLogs.map((log) => ({
      id: log.id,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt,
    })),
    stats,
  }
}
