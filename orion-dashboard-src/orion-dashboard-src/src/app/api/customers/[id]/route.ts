import { NextRequest, NextResponse } from 'next/server'
import { PATCH_customer, DELETE_customer } from '@/lib/api-handlers'
export const dynamic = 'force-dynamic'
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return PATCH_customer(req, id)
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return DELETE_customer(req, id)
}
