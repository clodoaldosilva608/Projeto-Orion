'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updatePasswordAction } from '@/modules/auth/services/auth.actions'
import { Eye, EyeOff, Lock, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  function passwordStrength(pw: string) {
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    return score
  }
  const strength = passwordStrength(password)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }
    if (strength < 2) {
      setError('Senha muito fraca. Use ao menos 8 caracteres com letras e números.')
      return
    }
    setLoading(true)
    setError(null)

    const result = await updatePasswordAction(password)
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    setDone(true)
    setLoading(false)
    setTimeout(() => router.push('/login'), 2500)
  }

  if (done) {
    return (
      <div className="glass-card p-10 shadow-2xl text-center animate-fade-in-up">
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
          style={{ background: 'rgb(16 185 129 / 0.15)', border: '1px solid rgb(16 185 129 / 0.3)' }}
        >
          <CheckCircle2 className="w-10 h-10" style={{ color: 'rgb(16 185 129)' }} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Senha redefinida!</h2>
        <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
          Redirecionando para o login...
        </p>
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
        <h1 className="text-2xl font-bold text-white">Redefinir senha</h1>
        <p className="text-sm mt-1" style={{ color: 'rgb(var(--text-secondary))' }}>
          Crie uma nova senha para sua conta.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
            Nova senha
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgb(var(--text-muted))' }} />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null) }}
              placeholder="Mínimo 8 caracteres"
              className="orion-input pl-11 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: 'rgb(var(--text-muted))' }}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
            Confirmar senha
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgb(var(--text-muted))' }} />
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(null) }}
              placeholder="Repita a senha"
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
          <span>{loading ? 'Salvando...' : 'Redefinir senha'}</span>
          <ArrowRight className="w-4 h-4 relative z-10" />
        </button>
      </form>

      <p className="text-center text-sm mt-6" style={{ color: 'rgb(var(--text-muted))' }}>
        <Link href="/login" className="font-medium transition-colors" style={{ color: 'rgb(var(--orion-indigo))' }}>
          Voltar ao login
        </Link>
      </p>
    </div>
  )
}
