/**
 * API Routes - Orion Admin Platform
 * CRUD completo para todas as entidades
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// =====================================================
// CUSTOMERS - List + Create
// =====================================================

// GET /api/customers - List all customers
export async function GET_customers(req: NextRequest) {
  const customers = await db.customer.findMany({
    where: { deletedAt: null },
    include: {
      _count: { select: { applications: true, licenses: true } },
      payments: { where: { status: 'succeeded' } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(customers)
}

// POST /api/customers - Create customer
export async function POST_customers(req: NextRequest) {
  const body = await req.json()
  const customer = await db.customer.create({
    data: {
      name: body.name,
      email: body.email,
      company: body.company || null,
      niche: body.niche || null,
      phone: body.phone || null,
      status: 'active',
      mfaEnabled: body.mfaEnabled || false,
    },
  })
  // Audit log
  await db.auditLog.create({
    data: {
      customerId: customer.id,
      action: 'create',
      entity: 'customer',
      entityId: customer.id,
      newValue: JSON.stringify(customer),
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
    },
  })
  return NextResponse.json(customer, { status: 201 })
}

// PATCH /api/customers/[id] - Update status (activate/suspend)
export async function PATCH_customer(req: NextRequest, id: string) {
  const body = await req.json()
  const oldCustomer = await db.customer.findUnique({ where: { id } })
  const customer = await db.customer.update({
    where: { id },
    data: { status: body.status },
  })
  await db.auditLog.create({
    data: {
      customerId: id,
      action: body.status === 'active' ? 'activate' : 'suspend',
      entity: 'customer',
      entityId: id,
      oldValue: JSON.stringify({ status: oldCustomer?.status }),
      newValue: JSON.stringify({ status: body.status }),
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
    },
  })
  return NextResponse.json(customer)
}

// DELETE /api/customers/[id] - Soft delete
export async function DELETE_customer(req: NextRequest, id: string) {
  const customer = await db.customer.update({
    where: { id },
    data: { deletedAt: new Date(), status: 'cancelled' },
  })
  await db.auditLog.create({
    data: {
      customerId: id,
      action: 'delete',
      entity: 'customer',
      entityId: id,
      oldValue: JSON.stringify(customer),
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
    },
  })
  return NextResponse.json({ success: true })
}

// =====================================================
// APPLICATIONS - List + Create + Publish + Rollback
// =====================================================

export async function GET_applications() {
  const apps = await db.application.findMany({
    where: { deletedAt: null },
    include: { customer: true },
    orderBy: { updatedAt: 'desc' },
  })
  return NextResponse.json(apps)
}

export async function POST_application(req: NextRequest) {
  const body = await req.json()
  const app = await db.application.create({
    data: {
      customerId: body.customerId,
      name: body.name,
      description: body.description || null,
      niche: body.niche || null,
      objective: body.objective || null,
      features: body.features ? JSON.stringify(body.features) : null,
      version: '1.0.0',
      status: 'draft',
      complexity: body.complexity || 'medium',
    },
  })
  await db.auditLog.create({
    data: {
      customerId: body.customerId,
      action: 'create',
      entity: 'application',
      entityId: app.id,
      newValue: JSON.stringify(app),
    },
  })
  return NextResponse.json(app, { status: 201 })
}

export async function PATCH_application(req: NextRequest, id: string) {
  const body = await req.json()
  const oldApp = await db.application.findUnique({ where: { id } })
  const app = await db.application.update({
    where: { id },
    data: {
      status: body.status,
      version: body.version || oldApp?.version,
      publishedAt: body.status === 'published' ? new Date() : oldApp?.publishedAt,
    },
  })
  await db.auditLog.create({
    data: {
      customerId: app.customerId,
      action: body.status === 'published' ? 'publish' : 'update',
      entity: 'application',
      entityId: id,
      oldValue: JSON.stringify({ status: oldApp?.status }),
      newValue: JSON.stringify({ status: body.status }),
    },
  })
  return NextResponse.json(app)
}

export async function DELETE_application(req: NextRequest, id: string) {
  const app = await db.application.update({
    where: { id },
    data: { deletedAt: new Date(), status: 'archived' },
  })
  await db.auditLog.create({
    data: {
      customerId: app.customerId,
      action: 'delete',
      entity: 'application',
      entityId: id,
    },
  })
  return NextResponse.json({ success: true })
}

// =====================================================
// LICENSES - List + Create + Status changes
// =====================================================

export async function GET_licenses() {
  const licenses = await db.license.findMany({
    include: { customer: true, application: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(licenses)
}

export async function POST_license(req: NextRequest) {
  const body = await req.json()
  const licenseKey = `ORN-${body.customerId.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${String(Date.now()).substring(-4)}`
  const license = await db.license.create({
    data: {
      customerId: body.customerId,
      applicationId: body.applicationId || null,
      licenseKey,
      plan: body.plan || 'starter',
      status: 'created',
      duration: body.duration || 365,
      maxUsers: body.maxUsers || 10,
      maxDevices: body.maxDevices || 1,
      maxApps: body.maxApps || 1,
      storageMb: body.storageMb || 500,
      price: body.price || 0,
      autoRenew: body.autoRenew ?? true,
    },
  })
  await db.auditLog.create({
    data: {
      customerId: body.customerId,
      action: 'create',
      entity: 'license',
      entityId: license.id,
      newValue: JSON.stringify(license),
    },
  })
  return NextResponse.json(license, { status: 201 })
}

export async function PATCH_license(req: NextRequest, id: string) {
  const body = await req.json()
  const oldLicense = await db.license.findUnique({ where: { id } })
  const updateData: any = { status: body.status }
  
  if (body.status === 'active') {
    updateData.activatedAt = new Date()
    updateData.startDate = new Date()
    updateData.endDate = new Date(Date.now() + (oldLicense?.duration || 365) * 24 * 60 * 60 * 1000)
  }
  if (body.status === 'suspended') {
    updateData.suspendedAt = new Date()
  }
  if (body.status === 'cancelled') {
    updateData.cancelledAt = new Date()
  }
  if (body.action === 'renew') {
    updateData.status = 'active'
    updateData.endDate = new Date(Date.now() + (oldLicense?.duration || 365) * 24 * 60 * 60 * 1000)
  }
  
  const license = await db.license.update({ where: { id }, data: updateData })
  await db.auditLog.create({
    data: {
      customerId: oldLicense?.customerId,
      action: body.action || body.status,
      entity: 'license',
      entityId: id,
      oldValue: JSON.stringify({ status: oldLicense?.status }),
      newValue: JSON.stringify({ status: body.status }),
    },
  })
  return NextResponse.json(license)
}

// =====================================================
// PAYMENTS - List + Refund
// =====================================================

export async function GET_payments() {
  const payments = await db.payment.findMany({
    include: { customer: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return NextResponse.json(payments)
}

export async function PATCH_payment(req: NextRequest, id: string) {
  const payment = await db.payment.update({
    where: { id },
    data: { status: 'refunded', refundedAt: new Date() },
  })
  await db.auditLog.create({
    data: {
      customerId: payment.customerId,
      action: 'refund',
      entity: 'payment',
      entityId: id,
    },
  })
  return NextResponse.json(payment)
}

// =====================================================
// TICKETS - List + Update status
// =====================================================

export async function GET_tickets() {
  const tickets = await db.supportTicket.findMany({
    include: { customer: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(tickets)
}

export async function PATCH_ticket(req: NextRequest, id: string) {
  const body = await req.json()
  const updateData: any = { status: body.status }
  if (body.status === 'resolved') updateData.resolvedAt = new Date()
  const ticket = await db.supportTicket.update({ where: { id }, data: updateData })
  return NextResponse.json(ticket)
}

// =====================================================
// NOTIFICATIONS - Mark as read
// =====================================================

export async function PATCH_notification(req: NextRequest, id: string) {
  const notification = await db.notification.update({
    where: { id },
    data: { read: true, readAt: new Date() },
  })
  return NextResponse.json(notification)
}

// =====================================================
// AUDIT LOGS - List
// =====================================================

export async function GET_auditLogs() {
  const logs = await db.auditLog.findMany({
    include: { customer: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return NextResponse.json(logs)
}
