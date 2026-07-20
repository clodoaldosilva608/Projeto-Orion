import { NextRequest, NextResponse } from 'next/server'
import { GET_customers, POST_customers } from '@/lib/api-handlers'
export const dynamic = 'force-dynamic'
export async function GET(req: NextRequest) { return GET_customers(req) }
export async function POST(req: NextRequest) { return POST_customers(req) }
