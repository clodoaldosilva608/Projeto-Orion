import { GET_auditLogs } from '@/lib/api-handlers'
export const dynamic = 'force-dynamic'
export async function GET() { return GET_auditLogs() }
