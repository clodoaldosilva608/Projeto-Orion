/**
 * AI Client — Orion Platform
 * Usa fetch nativo para chamar OpenAI API (GPT-4o-mini)
 * Se não houver OPENAI_API_KEY, retorna fallback gracioso.
 */

const AI_URL = 'https://api.openai.com/v1/chat/completions'
const AI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'
const AI_TIMEOUT = 20000

export const aiEnabled = Boolean(process.env.OPENAI_API_KEY)

export interface AIResponse {
  text: string
  usedFallback: boolean
}

export async function askAI(
  systemPrompt: string,
  userMessage: string,
  context?: string
): Promise<AIResponse> {
  if (!aiEnabled) {
    return {
      text: 'Assistente IA não está configurado neste ambiente. Adicione OPENAI_API_KEY nas variáveis de ambiente para ativar.',
      usedFallback: true,
    }
  }

  const userContent = context
    ? `Contexto (dados da empresa, sem PII):\n${context}\n\nPergunta do usuário:\n${userMessage}`
    : userMessage

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT)

    const res = await fetch(AI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!res.ok) {
      const detail = await res.json().catch(() => ({}))
      const reason = res.status === 401
        ? 'Credencial da API de IA inválida.'
        : detail.error?.message || `Erro ${res.status}`
      return { text: `Não consegui consultar o assistente (${reason}). Tente novamente.`, usedFallback: true }
    }

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content?.trim()

    if (!text) {
      return { text: 'O assistente não retornou uma resposta utilizável.', usedFallback: true }
    }

    return { text, usedFallback: false }
  } catch (error: any) {
    const msg = error.name === 'AbortError'
      ? 'A consulta à IA demorou muito (timeout).'
      : error.message || 'Erro desconhecido'
    return { text: `Não foi possível obter resposta da IA (${msg}).`, usedFallback: true }
  }
}

/**
 * Gera um insight diário baseado nos dados do dashboard
 */
export async function getDailyInsight(kpis: {
  clients: number
  projects: number
  applications: number
  licenses: number
  mrr: number
  aiUsage: number
}): Promise<string> {
  if (!aiEnabled) {
    const insights = [
      `Você tem ${kpis.clients} clientes ativos e ${kpis.projects} projetos em andamento. Considere revisar projetos com progresso < 50%.`,
      `MRR atual: R$ ${kpis.mrr.toFixed(2)}. Com ${kpis.licenses} licenças ativas, o ticket médio é R$ ${(kpis.mrr / Math.max(kpis.licenses, 1)).toFixed(2)}.`,
      `Uso de IA: ${kpis.aiUsage.toLocaleString('pt-BR')} tokens. Monitore o consumo para não ultrapassar o limite mensal.`,
      `${kpis.applications} aplicações publicadas. Verifique se há aplicações com status 'deprecated' que precisam de atualização.`,
    ]
    return insights[Math.floor(Math.random() * insights.length)]
  }

  const result = await askAI(
    'Você é um assistente de business intelligence da plataforma Orion. Gere insights curtos (máx 2 frases) baseados nos KPIs. Seja direto e actionable.',
    `KPIs: ${kpis.clients} clientes, ${kpis.projects} projetos, ${kpis.applications} aplicações, ${kpis.licenses} licenças, MRR R$ ${kpis.mrr}, IA ${kpis.aiUsage} tokens.`
  )
  return result.text
}
