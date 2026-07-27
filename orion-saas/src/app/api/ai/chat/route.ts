import { NextRequest, NextResponse } from 'next/server'
import { askAI } from '@/lib/ai'
import { prisma } from '@/lib/db'
import { createSupabaseServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { message } = await request.json()
  if (!message) return NextResponse.json({ error: 'Mensagem obrigatória' }, { status: 400 })

  // Busca contexto (sem PII)
  let context = ''
  try {
    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
    if (dbUser) {
      const [clients, projects, goals] = await Promise.all([
        prisma.saasClient.count(),
        prisma.saasProject.count(),
        prisma.goal.count({ where: { companyId: dbUser.companyId } }),
      ])
      context = `Plataforma Orion: ${clients} clientes, ${projects} projetos, ${goals} metas.`
    }
  } catch {}

  const result = await askAI(
    'Você é o assistente IA da plataforma Orion, uma fábrica inteligente de software. Responda perguntas sobre gestão de projetos, metas, indicadores e performance. Seja conciso e profissional. Responda sempre em português.',
    message,
    context
  )

  return NextResponse.json({ text: result.text, usedFallback: result.usedFallback })
}
