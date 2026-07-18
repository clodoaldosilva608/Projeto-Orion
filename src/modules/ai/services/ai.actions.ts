'use server'

import { prisma } from '@/shared/lib/prisma'
import { createClient } from '@/shared/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { aiEnabled, askAI } from '@/modules/ai/lib/ai-client'

// ================================================================
// ORION - FASE 11: AÇÕES DO MÓDULO DE IA
// Princípios (Doc 12): human-in-the-loop (apenas SUGERE, nunca
// muta banco), privacidade (contexto agregado/anonimizado),
// auditoria (logInteraction via console) e fallback gracioso.
// ================================================================

export interface AssistantResult {
  text: string
  usedFallback: boolean
  error: string | null
}

export interface DailyInsightResult {
  insight: string
  usedFallback: boolean
  error: string | null
}

// ----------------------------------------------------------------
// Montagem de contexto AGREGADO e ANONIMIZADO da empresa.
// Nunca incluímos e-mails ou nomes reais de pessoas — apenas
// posições/agregados (ex.: "Vendedor #1", totais, metas).
// ----------------------------------------------------------------
async function buildCompanyContext(companyId: bigint): Promise<string> {
  // Metas ativas com indicador e resultados aprovados
  const goals = await prisma.goal.findMany({
    where: { companyId, active: true },
    include: {
      indicator: { select: { name: true, unit: true } },
      results: { where: { status: 'approved', active: true } },
    },
  })

  const goalLines = goals.map((goal) => {
    const target = Number(goal.targetValue)
    const achieved = goal.results.reduce((acc, r) => acc + Number(r.value), 0)
    const pct = target > 0 ? Math.min(100, Math.round((achieved / target) * 100)) : 0
    return `- Meta "${goal.name}" (${goal.indicator.name}, ${goal.indicator.unit}): alvo ${target}, realizado ${achieved} (${pct}% do alvo)`
  })

  const totalTargets = goals.reduce((acc, g) => acc + Number(g.targetValue), 0)
  const totalAchieved = goals.reduce(
    (acc, g) => acc + g.results.reduce((a, r) => a + Number(r.value), 0),
    0
  )
  const overallPct =
    totalTargets > 0 ? Math.round((totalAchieved / totalTargets) * 100) : 0

  // Ranking agregado e ANONIMIZADO (apenas posição + totais)
  const results = await prisma.result.findMany({
    where: { companyId, status: 'approved', active: true },
    select: { userId: true, value: true },
  })

  const byUser = new Map<string, { total: number; count: number }>()
  for (const r of results) {
    const uid = r.userId.toString()
    const cur = byUser.get(uid) ?? { total: 0, count: 0 }
    cur.total += Number(r.value)
    cur.count += 1
    byUser.set(uid, cur)
  }

  const ranking = Array.from(byUser.entries())
    .map(([uid, v]) => ({ uid, ...v }))
    .sort((a, b) => b.total - a.total)

  const top3 = ranking.slice(0, 3).map(
    (entry, idx) =>
      `Vendedor #${idx + 1}: ${entry.total} em ${entry.count} lançamentos aprovados`
  )
  const bottom3 = ranking
    .slice(-3)
    .reverse()
    .map(
      (entry, idx) =>
        `Vendedor #${ranking.length - idx}: ${entry.total} em ${entry.count} lançamentos aprovados`
    )

  const lines: string[] = []
  lines.push(`Resumo geral: ${goals.length} metas ativas.`)
  lines.push(
    `Total acumulado de alvos: ${totalTargets}; total realizado: ${totalAchieved} (${overallPct}% do total).`
  )
  if (goalLines.length > 0) {
    lines.push('Metas:')
    lines.push(...goalLines)
  }
  if (top3.length > 0) {
    lines.push('Top 3 vendedores (agregado):')
    lines.push(...top3)
  }
  if (bottom3.length > 0) {
    lines.push('Bottom 3 vendedores (agregado):')
    lines.push(...bottom3)
  }

  return lines.join('\n')
}

const SYSTEM_PROMPT_ASSISTANT = `Você é um analista de desempenho da plataforma Orion, especializado em metas, indicadores e engajamento de equipes de vendas.
Regras:
- Responda sempre em português do Brasil (PT-BR).
- Baseie-se apenas no contexto agregado fornecido (metas, indicadores, totais). Nunca invente dados que não estejam no contexto.
- Quando citar números, referencie a fonte (ex.: "Meta X", "Top 3 vendedores", "total acumulado").
- Você apenas SUGERE. Nunca afirme que alterou, criou ou removeu dados no banco.
- Seja conciso, prático e orientado a ação. Use listas quando fizer sentido.
- Se o contexto estiver vazio ou insuficiente, diga claramente que não há dados suficientes e sugira cadastrar metas/resultados.`

const SYSTEM_PROMPT_INSIGHT = `Você é um analista executivo da plataforma Orion. Gere um "insight diário" curto (máx. 6 linhas) em português do Brasil (PT-BR),
baseado no contexto agregado fornecido (faturamento/realizado vs metas, Top/Bottom vendedores em termos agregados).
Destaque: 1) situação geral vs meta, 2) ponto de atenção, 3) uma sugestão de ação.
Não invente dados. Não mencione nomes ou e-mails reais de pessoas — use apenas agregados/posições.`

// ----------------------------------------------------------------
// AUDITORIA simples: registra interações no console (Doc 12).
// ----------------------------------------------------------------
export async function logInteractionAction(
  pergunta: string,
  resposta: string,
  usedFallback: boolean
): Promise<void> {
  try {
    console.log(
      `[IA:AUDIT] fallback=${usedFallback} | P: ${pergunta.slice(0, 120)} | R: ${resposta.slice(0, 120)}`
    )
  } catch {
    /* auditoria nunca deve quebrar o fluxo */
  }
}

// ----------------------------------------------------------------
// Pergunta ao assistente (chat). Monta contexto anonimizado e chama a IA.
// ----------------------------------------------------------------
export async function askAssistantAction(message: string): Promise<AssistantResult> {
  if (!message || message.trim().length === 0) {
    return { text: '', usedFallback: false, error: 'Informe uma pergunta.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { text: '', usedFallback: false, error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
  if (!dbUser) return { text: '', usedFallback: false, error: 'Usuário não encontrado' }

  try {
    const context = await buildCompanyContext(dbUser.companyId)
    const { text, usedFallback } = await askAI(SYSTEM_PROMPT_ASSISTANT, message.trim(), context)

    await logInteractionAction(message.trim(), text, usedFallback)
    revalidatePath('/ia')

    return { text, usedFallback, error: null }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao consultar o assistente.'
    console.error('[ai.actions] askAssistantAction:', msg)
    return { text: '', usedFallback: true, error: msg }
  }
}

// ----------------------------------------------------------------
// Insight diário (resumo executivo). Fallback estático se IA desligada.
// ----------------------------------------------------------------
export async function getDailyInsightAction(): Promise<DailyInsightResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { insight: '', usedFallback: false, error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
  if (!dbUser) return { insight: '', usedFallback: false, error: 'Usuário não encontrado' }

  try {
    const context = await buildCompanyContext(dbUser.companyId)

    if (!aiEnabled) {
      const fallback = [
        'Insight diário (modo fallback):',
        'O assistente de IA ainda não está configurado neste ambiente.',
        'Para habilitar análises inteligentes, defina OPENAI_API_KEY no arquivo .env e reinicie o servidor.',
        'Enquanto isso, acompanhe metas e ranking pelas telas do Orion.',
      ].join('\n')
      return { insight: fallback, usedFallback: true, error: null }
    }

    const { text, usedFallback } = await askAI(SYSTEM_PROMPT_INSIGHT, 'Gere o insight diário de hoje.', context)

    await logInteractionAction('[insight-diario]', text, usedFallback)
    revalidatePath('/ia')

    return { insight: text, usedFallback, error: null }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao gerar insight.'
    console.error('[ai.actions] getDailyInsightAction:', msg)
    return { insight: '', usedFallback: true, error: msg }
  }
}
