'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loginAction } from '@/modules/auth/services/auth.actions'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await loginAction({ email, password })

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="glass-card p-8 shadow-2xl animate-fade-in-up">
      {/* Logo */}
      <div className="text-center mb-8">
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg glow-indigo"
          style={{ background: 'linear-gradient(135deg, rgb(99 102 241), rgb(168 85 247))' }}
        >
          <span className="text-white font-black text-xl tracking-tight">O</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Bem-vindo ao Orion</h1>
        <p className="text-sm mt-1" style={{ color: 'rgb(var(--text-secondary))' }}>
          Gerencie seu time comercial com inteligência
        </p>
      </div>

      {/* Form */}
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

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
            Senha
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgb(var(--text-muted))' }} />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null) }}
              placeholder="••••••••"
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

        {error && (
          <div className="rounded-xl px-4 py-3" style={{ background: 'rgb(244 63 94 / 0.1)', border: '1px solid rgb(244 63 94 / 0.3)' }}>
            <p className="text-sm" style={{ color: 'rgb(244 63 94)' }}>{error}</p>
          </div>
        )}

        <div className="flex items-center justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-medium transition-colors"
            style={{ color: 'rgb(var(--orion-indigo))' }}
          >
            Esqueceu a senha?
          </Link>
        </div>

        <button
          type="submit"
          id="btn-login"
          disabled={loading}
          className="btn-gradient w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{loading ? 'Entrando...' : 'Entrar na plataforma'}</span>
        </button>
      </form>

      <p className="text-center text-sm mt-6" style={{ color: 'rgb(var(--text-muted))' }}>
        Não tem conta?{' '}
        <Link href="/register" className="font-medium transition-colors" style={{ color: 'rgb(var(--orion-indigo))' }}>
          Criar conta gratuita
        </Link>
      </p>
    </div>
  )
}
