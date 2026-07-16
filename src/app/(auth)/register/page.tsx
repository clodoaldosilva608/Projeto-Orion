'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { registerAction } from '@/modules/auth/services/auth.actions'
import { Eye, EyeOff, Building2, User, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    companyName: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const passwordStrength = (pw: string) => {
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    return score
  }

  const strength = passwordStrength(formData.password)
  const strengthColors = ['', 'bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500']
  const strengthLabels = ['', 'Fraca', 'Razoável', 'Boa', 'Forte']

  function handleChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  function handleNextStep(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.companyName.trim()) {
      setError('Nome da empresa é obrigatório')
      return
    }
    setStep(2)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }
    if (strength < 2) {
      setError('Senha muito fraca. Use ao menos 8 caracteres com letras e números.')
      return
    }
    setLoading(true)
    setError(null)

    const result = await registerAction({
      companyName: formData.companyName,
      name: formData.name,
      email: formData.email,
      password: formData.password,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/login'), 3000)
  }

  if (success) {
    return (
      <div className="glass-card p-10 shadow-2xl text-center animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
          style={{ background: 'rgb(16 185 129 / 0.15)', border: '1px solid rgb(16 185 129 / 0.3)' }}>
          <CheckCircle2 className="w-10 h-10" style={{ color: 'rgb(16 185 129)' }} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Conta criada!</h2>
        <p className="text-sm mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>
          Verifique seu e-mail para confirmar o cadastro.
        </p>
        <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
          Redirecionando para o login...
        </p>
      </div>
    )
  }

  return (
    <div className="glass-card p-8 shadow-2xl animate-fade-in-up">
      {/* Header */}
      <div className="text-center mb-8">
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg glow-indigo"
          style={{ background: 'linear-gradient(135deg, rgb(99 102 241), rgb(168 85 247))' }}
        >
          <span className="text-white font-black text-xl tracking-tight">O</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Criar conta gratuita</h1>
        <p className="text-sm mt-1" style={{ color: 'rgb(var(--text-secondary))' }}>
          Configure sua empresa em menos de 2 minutos
        </p>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center gap-2 flex-1">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            step >= 1 ? 'text-white' : 'text-gray-500'
          }`} style={{ background: step >= 1 ? 'linear-gradient(135deg, rgb(99 102 241), rgb(168 85 247))' : 'rgb(var(--surface-3))' }}>
            1
          </div>
          <span className="text-xs font-medium" style={{ color: step === 1 ? 'rgb(var(--text-primary))' : 'rgb(var(--text-muted))' }}>
            Empresa
          </span>
        </div>
        <div className="flex-1 h-px" style={{ background: 'rgb(var(--glass-border))' }} />
        <div className="flex items-center gap-2 flex-1">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all`}
            style={{ background: step >= 2 ? 'linear-gradient(135deg, rgb(99 102 241), rgb(168 85 247))' : 'rgb(var(--surface-3))', color: step >= 2 ? 'white' : 'rgb(var(--text-muted))' }}>
            2
          </div>
          <span className="text-xs font-medium" style={{ color: step === 2 ? 'rgb(var(--text-primary))' : 'rgb(var(--text-muted))' }}>
            Acesso
          </span>
        </div>
      </div>

      {/* Step 1: Company */}
      {step === 1 && (
        <form onSubmit={handleNextStep} className="space-y-5 animate-fade-in">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
              Nome da empresa *
            </label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgb(var(--text-muted))' }} />
              <input
                id="companyName"
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                placeholder="Ex: Acme Vendas Ltda."
                className="orion-input pl-11"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3" style={{ background: 'rgb(244 63 94 / 0.1)', border: '1px solid rgb(244 63 94 / 0.3)' }}>
              <p className="text-sm" style={{ color: 'rgb(244 63 94)' }}>{error}</p>
            </div>
          )}

          <button type="submit" className="btn-gradient w-full py-3 flex items-center justify-center gap-2">
            <span>Continuar</span>
            <ArrowRight className="w-4 h-4 relative z-10" />
          </button>
        </form>
      )}

      {/* Step 2: User credentials */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
              Seu nome completo *
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgb(var(--text-muted))' }} />
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="João da Silva"
                className="orion-input pl-11"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
              E-mail *
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgb(var(--text-muted))' }} />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="joao@empresa.com.br"
                className="orion-input pl-11"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
              Senha *
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgb(var(--text-muted))' }} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
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
            {formData.password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColors[strength] : 'bg-slate-700'}`}
                    />
                  ))}
                </div>
                <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
                  Força: <span className="font-medium">{strengthLabels[strength]}</span>
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
              Confirmar senha *
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgb(var(--text-muted))' }} />
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
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

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgb(var(--surface-2))', color: 'rgb(var(--text-secondary))', border: '1px solid rgb(var(--glass-border))' }}
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-gradient flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Criando conta...' : 'Criar conta'}</span>
            </button>
          </div>
        </form>
      )}

      <p className="text-center text-sm mt-6" style={{ color: 'rgb(var(--text-muted))' }}>
        Já tem conta?{' '}
        <Link href="/login" className="font-medium transition-colors" style={{ color: 'rgb(var(--orion-indigo))' }}>
          Entrar
        </Link>
      </p>
    </div>
  )
}
