import { prisma } from './db'

export async function logAudit(params: {
  companyId: bigint
  userId?: bigint | null
  action: string
  tableName: string
  recordId?: bigint | null
  oldValue?: any
  newValue?: any
  ipAddress?: string
}) {
  try {
    await prisma.auditLog.create({
      data: {
        companyId: params.companyId,
        userId: params.userId || null,
        action: params.action as any,
        tableName: params.tableName,
        recordId: params.recordId || null,
        oldValue: params.oldValue || undefined,
        newValue: params.newValue || undefined,
        ipAddress: params.ipAddress || '0.0.0.0',
      },
    })
  } catch (e) {
    console.error('[audit] Falha ao registrar:', e)
  }
}
