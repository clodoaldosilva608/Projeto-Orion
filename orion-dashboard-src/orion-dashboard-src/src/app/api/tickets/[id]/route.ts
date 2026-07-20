import { NextRequest } from 'next/server'
import { PATCH_ticket } from '@/lib/api-handlers'
export const dynamic = 'force-dynamic'
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return PATCH_ticket(req, id)
}
