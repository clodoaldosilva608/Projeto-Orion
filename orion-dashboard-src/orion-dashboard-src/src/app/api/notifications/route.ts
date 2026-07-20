import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
export const dynamic = 'force-dynamic'
export async function PATCH(req: NextRequest) {
  const body = await req.json()
  if (body.markAll) {
    await db.notification.updateMany({ where: { read: false }, data: { read: true, readAt: new Date() } })
    return NextResponse.json({ success: true })
  }
  const notification = await db.notification.update({ where: { id: body.id }, data: { read: true, readAt: new Date() } })
  return NextResponse.json(notification)
}
