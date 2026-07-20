import { NextRequest } from 'next/server'
import { PATCH_payment } from '@/lib/api-handlers'
export const dynamic = 'force-dynamic'
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return PATCH_payment(req, id)
}
