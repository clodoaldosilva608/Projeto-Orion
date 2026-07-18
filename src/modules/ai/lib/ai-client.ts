// ================================================================
// ORION - AI CLIENT (FASE 11)
// Helper de acesso à IA com FALLBACK GRACIOSO.
// Não depende de nenhum pacote externo: usa fetch nativo (Node 22).
// Se não houver OPENAI_API_KEY no ambiente, expõe aiEnabled=false e
// todas as chamadas retornam uma resposta de fallback amigável.
// ================================================================

export const aiEnabled = Boolean(process.env.OPENAI_API_KEY)

const AI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
const AI_TIMEOUT_MS = 20_000

export interface AIResponse {
  text: string
  usedFallback: boolean
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// Tipo local para a resposta da OpenAI (evita dependência de pacotes externos)
interface OpenAIChatCompletion {
  choices?: Array<{ message?: { content?: string } }>
  error?: { message?: string }
}

/**
 * Envia uma requisição à IA (OpenAI-compatible) e retorna o texto gerado.
 * Em caso de ausência de chave ou erro (timeout, 401, etc.), retorna uma
 * resposta de fallback com usedFallback=true — o app continua funcionando.
 */
export async function askAI(
  systemPrompt: string,
  userMessage: string,
  context?: string
): Promise<AIResponse> {
  if (!aiEnabled) {
    return {
      text: 'Assistente IA não está configurado neste ambiente.',
      usedFallback: true,
    }
  }

  const userContent = context
    ? `Contexto (dados agregados da empresa, sem PII):\n${context}\n\nPergunta do usuário:\n${userMessage}`
    : userMessage

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ]

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)

  try {
    const res = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY as string}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages,
        temperature: 0.3,
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      const detail: OpenAIChatCompletion = await res.json().catch(() => ({}))
      const reason =
        res.status === 401
          ? 'Credencial da API de IA inválida ou expirada.'
          : (detail.error?.message ?? `Erro ${res.status} na API de IA.`)
      console.warn('[ai-client] Falha na chamada da IA:', reason)
      return {
        text: `No momento não consegui consultar o assistente (${reason}). Tente novamente mais tarde.`,
        usedFallback: true,
      }
    }

    const data: OpenAIChatCompletion = (await res.json()) as OpenAIChatCompletion
    const text = data.choices?.[0]?.message?.content?.trim()

    if (!text) {
      return {
        text: 'O assistente não retornou uma resposta utilizável. Tente reformular a pergunta.',
        usedFallback: true,
      }
    }

    return { text, usedFallback: false }
  } catch (error: unknown) {
    const message =
      error instanceof Error && error.name === 'AbortError'
        ? 'A consulta à IA demorou muito (timeout).'
        : error instanceof Error
          ? error.message
          : 'Erro desconhecido ao chamar a IA.'
    console.warn('[ai-client] Erro ao chamar IA:', message)
    return {
      text: `Não foi possível obter resposta da IA (${message}). O assistente volta ao modo de fallback.`,
      usedFallback: true,
    }
  } finally {
    clearTimeout(timeout)
  }
}
