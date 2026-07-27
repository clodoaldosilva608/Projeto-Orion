'use server'
import { askAI, getDailyInsight } from './ai'
import { prisma } from './db'
import { createSupabaseServerClient } from './supabase'

async function getCurrentUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return await prisma.user.findUnique({ where: { supabaseId: user.id } })
}

export async function askAssistantAction(message: string) {
  const dbUser = await getCurrentUser()
  if (!dbUser) return { error: 'Não autorizado' }

  // Busca contexto da empresa (sem PII)
  let context = ''
  try {
    const [clients, projects, goals, results] = await Promise.all([
      prisma.saasClient.count(),
      prisma.saasProject.count(),
      prisma.goal.count({ where: { companyId: dbUser.companyId } }),
      prisma.result.count({ where: { companyId: dbUser.companyId, status: 'approved' } }),
    ])
    context = `Empresa tem ${clients} clientes, ${projects} projetos, ${goals} metas, ${results} resultados aprovados.`
  } catch {}

  const result = await askAI(
    'Você é o assistente IA da plataforma Orion, uma fábrica inteligente de software. Responda perguntas sobre gestão de projetos, metas, indicadores e performance. Seja conciso e profissional. Responda sempre em português.',
    message,
    context
  )

  return { data: result, error: null }
}

export async function getDailyInsightAction() {
  const dbUser = await getCurrentUser()
  if (!dbUser) return { error: 'Não autorizado' }

  let kpis = { clients: 0, projects: 0, applications: 0, licenses: 0, mrr: 0, aiUsage: 0 }
  try {
    const [clients, projects, apps, licenses, payments] = await Promise.all([
      prisma.saasClient.count(),
      prisma.saasProject.count(),
      prisma.saasApplication.count(),
      prisma.saasLicense.count({ where: { status: 'active' } }),
      prisma.saasPayment.aggregate({ where: { status: 'approved' }, _sum: { amountCents: true } }),
    ])
    kpis = {
      clients, projects, applications: apps, licenses,
      mrr: Number(payments._sum?.amountCents || 0) / 100,
      aiUsage: 24586,
    }
  } catch {}

  const insight = await getDailyInsight(kpis)
  return { data: insight, error: null }
}
