'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { resetPasswordAction } from '@/modules/auth/services/auth.actions'
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await resetPasswordAction(email)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="glass-card p-10 shadow-2xl text-center animate-fade-in-up">
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
          style={{ background: 'rgb(16 185 129 / 0.15)', border: '1px solid rgb(16 185 129 / 0.3)' }}
        >
          <CheckCircle2 className="w-10 h-10" style={{ color: 'rgb(16 185 129)' }} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">E-mail enviado!</h2>
        <p className="text-sm mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>
          Enviamos um link para <span className="font-medium text-white">{email}</span> com instruções para redefinir sua senha.
        </p>
        <p className="text-xs mb-6" style={{ color: 'rgb(var(--text-muted))' }}>
          Não recebeu? Verifique a pasta de spam ou tente novamente.
        </p>
        <Link href="/login" className="btn-gradient w-full py-3 flex items-center justify-center gap-2">
          <span>Voltar ao login</span>
          <ArrowRight className="w-4 h-4 relative z-10" />
        </Link>
      </div>
    )
  }

  return (
    <div className="glass-card p-8 shadow-2xl animate-fade-in-up">
      <div className="text-center mb-8">
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg glow-indigo"
          style={{ background: 'linear-gradient(135deg, rgb(99 102 241), rgb(168 85 247))' }}
        >
          <span className="text-white font-black text-xl tracking-tight">O</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Esqueceu a senha?</h1>
        <p className="text-sm mt-1" style={{ color: 'rgb(var(--text-secondary))' }}>
          Digite seu e-mail e enviaremos um link de redefinição.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
            E-mail
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgb(var(--text-muted))' }} />
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null) }}
              placeholder="seu@email.com.br"
              className="orion-input pl-11"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl px-4 py-3" style={{ background: 'rgb(244 63 94 / 0.1)', border: '1px solid rgb(244 63 94 / 0.3)' }}>
            <p className="text-sm" style={{ color: 'rgb(244 63 94)' }}>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-gradient w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{loading ? 'Enviando...' : 'Enviar link de redefinição'}</span>
          <ArrowRight className="w-4 h-4 relative z-10" />
        </button>
      </form>

      <p className="text-center text-sm mt-6" style={{ color: 'rgb(var(--text-muted))' }}>
        Lembrou a senha?{' '}
        <Link href="/login" className="font-medium transition-colors" style={{ color: 'rgb(var(--orion-indigo))' }}>
          Entrar
        </Link>
      </p>
    </div>
  )
}
