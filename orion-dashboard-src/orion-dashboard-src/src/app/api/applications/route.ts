import { NextRequest } from 'next/server'
import { GET_applications, POST_application } from '@/lib/api-handlers'
export const dynamic = 'force-dynamic'
export async function GET() { return GET_applications() }
export async function POST(req: NextRequest) { return POST_application(req) }
