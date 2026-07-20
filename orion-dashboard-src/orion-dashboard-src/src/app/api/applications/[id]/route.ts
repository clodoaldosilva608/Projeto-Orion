import { NextRequest } from 'next/server'
import { PATCH_application, DELETE_application } from '@/lib/api-handlers'
export const dynamic = 'force-dynamic'
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return PATCH_application(req, id)
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return DELETE_application(req, id)
}
