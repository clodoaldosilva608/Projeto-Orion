'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import {
  Sparkles,
  Send,
  Loader2,
  AlertTriangle,
  MessageSquare,
  Lightbulb,
  ShieldCheck,
  User,
} from 'lucide-react'
import {
  askAssistantAction,
  getDailyInsightAction,
} from '@/modules/ai/services/ai.actions'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  fallback?: boolean
}

interface Props {
  aiEnabled: boolean
  initialInsight: string
}

function newId(): string {
  return Math.random().toString(36).slice(2)
}

export default function IaClient({ aiEnabled, initialInsight }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [insight, setInsight] = useState<string>(initialInsight)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isInsightPending, startInsightTransition] = useTransition()
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, insight])

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || isPending || !aiEnabled) return

    setError(null)
    const userMsg: ChatMessage = { id: newId(), role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')

    startTransition(async () => {
      const res = await askAssistantAction(text)
      if (res.error) {
        setError(res.error)
        return
      }
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: 'assistant',
          content: res.text,
          fallback: res.usedFallback,
        },
      ])
    })
  }

  function handleInsight() {
    if (isInsightPending || !aiEnabled) return
    setError(null)
    startInsightTransition(async () => {
      const res = await getDailyInsightAction()
      if (res.error) {
        setError(res.error)
        return
      }
      setInsight(res.insight)
    })
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <Sparkles className="w-6 h-6" style={{ color: 'rgb(var(--orion-indigo))' }} />
            Assistente de IA
          </h1>
          <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
            Análise de desempenho, metas e indicadores — com explicações e fontes.
          </p>
        </div>
        <button
          type="button"
          onClick={handleInsight}
          disabled={!aiEnabled || isInsightPending}
          className="btn-gradient inline-flex items-center gap-2 disabled:opacity-50"
        >
          {isInsightPending ? (
            <Loader2 className="w-4 h-4 animate-spin relative z-10" />
          ) : (
            <Lightbulb className="w-4 h-4 relative z-10" />
          )}
          <span>Gerar insight diário</span>
        </button>
      </div>

      {/* Banner: IA não configurada */}
      {!aiEnabled && (
        <div
          className="rounded-xl p-4 flex items-start gap-3"
          style={{ background: 'rgb(245 158 11 / 0.1)', border: '1px solid rgb(245 158 11 / 0.35)' }}
        >
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-300">Assistente IA não configurado</p>
            <p className="text-sm text-amber-200/80">
              Defina a variável <code className="px-1 rounded" style={{ background: 'rgb(0 0 0 / 0.25)' }}>OPENAI_API_KEY</code> no arquivo <code className="px-1 rounded" style={{ background: 'rgb(0 0 0 / 0.25)' }}>.env</code> e reinicie o servidor para ativar o chat inteligente. A página continua funcionando em modo limitado.
            </p>
          </div>
        </div>
      )}

      {/* Insight diário */}
      {(insight || isInsightPending) && (
        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <h2 className="font-semibold text-white text-sm">Insight Diário</h2>
            {!aiEnabled && (
              <span className="badge badge-warning" style={{ fontSize: '10px' }}>FALLBACK</span>
            )}
          </div>
          {isInsightPending ? (
            <div className="flex items-center gap-2 text-sm" style={{ color: 'rgb(var(--text-muted))' }}>
              <Loader2 className="w-4 h-4 animate-spin" /> Gerando análise...
            </div>
          ) : (
            <p className="text-sm whitespace-pre-line" style={{ color: 'rgb(var(--text-secondary))' }}>
              {insight}
            </p>
          )}
        </div>
      )}

      {/* Aviso de erro */}
      {error && (
        <div
          className="rounded-xl p-4 flex items-center gap-3"
          style={{ background: 'rgb(244 63 94 / 0.1)', border: '1px solid rgb(244 63 94 / 0.3)' }}
        >
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          <p className="text-sm text-rose-400">{error}</p>
        </div>
      )}

      {/* Chat */}
      <div
        className="glass-card flex flex-col overflow-hidden"
        style={{ height: 'clamp(360px, 55vh, 560px)' }}
      >
        {/* Mensagens */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
              <MessageSquare className="w-10 h-10 mb-3" style={{ color: 'rgb(var(--text-muted))' }} />
              <p className="text-sm font-medium text-white">Como posso ajudar?</p>
              <p className="text-xs mt-1 max-w-xs" style={{ color: 'rgb(var(--text-muted))' }}>
                Pergunte sobre metas, indicadores ou desempenho da equipe. A IA responde em PT-BR e cita as fontes.
              </p>
            </div>
          )}

          {messages.map((m) => {
            const isUser = m.role === 'user'
            return (
              <div key={m.id} className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow"
                  style={{
                    background: isUser
                      ? 'rgb(var(--surface-2))'
                      : 'linear-gradient(135deg, rgb(99 102 241), rgb(168 85 247))',
                  }}
                >
                  {isUser ? (
                    <User className="w-4 h-4 text-gray-200" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-white" />
                  )}
                </div>
                <div
                  className="max-w-[78%] rounded-2xl px-4 py-2.5 text-sm"
                  style={{
                    background: isUser
                      ? 'rgb(var(--orion-indigo) / 0.18)'
                      : 'rgb(var(--surface-1))',
                    border: '1px solid rgb(var(--glass-border))',
                    color: 'rgb(var(--text-secondary))',
                  }}
                >
                  <p className="whitespace-pre-line">{m.content}</p>
                  {m.fallback && (
                    <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: 'rgb(var(--text-muted))' }}>
                      <AlertTriangle className="w-3 h-3" /> Resposta de fallback (modo limitado)
                    </p>
                  )}
                </div>
              </div>
            )
          })}

          {isPending && (
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow"
                style={{ background: 'linear-gradient(135deg, rgb(99 102 241), rgb(168 85 247))' }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div
                className="rounded-2xl px-4 py-3"
                style={{ background: 'rgb(var(--surface-1))', border: '1px solid rgb(var(--glass-border))' }}
              >
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'rgb(var(--text-muted))' }} />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="p-3 flex items-center gap-2"
          style={{ borderTop: '1px solid rgb(var(--glass-border))' }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!aiEnabled}
            placeholder={
              aiEnabled
                ? 'Pergunte algo sobre metas e desempenho...'
                : 'IA desabilitada — configure OPENAI_API_KEY no .env'
            }
            className="input-field flex-1 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!aiEnabled || isPending || input.trim().length === 0}
            className="btn-gradient inline-flex items-center gap-2 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin relative z-10" />
            ) : (
              <Send className="w-4 h-4 relative z-10" />
            )}
            <span>Enviar</span>
          </button>
        </form>
      </div>

      {/* Aviso Doc 12: human-in-the-loop / privacidade */}
      <div
        className="rounded-xl p-3 flex items-start gap-3 text-xs"
        style={{ background: 'rgb(var(--glass-bg))', border: '1px solid rgb(var(--glass-border))', color: 'rgb(var(--text-muted))' }}
      >
        <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'rgb(var(--orion-indigo))' }} />
        <p>
          O assistente apenas <strong>sugere</strong> — ele nunca altera dados do banco (human-in-the-loop).
          A análise usa apenas dados <strong>agregados e anonimizados</strong> (metas, totais, posições), sem nomes ou e-mails reais.
          Interações podem ser auditadas.
        </p>
      </div>
    </div>
  )
}
