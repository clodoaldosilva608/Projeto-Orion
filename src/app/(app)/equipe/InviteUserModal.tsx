'use client'

import { useState, useTransition } from 'react'
import { inviteUserAction } from '@/modules/users/services/users.actions'
import { X, UserPlus, Mail, User, Briefcase, Loader2, CheckCircle2 } from 'lucide-react'

interface Props {
  onClose: () => void
}

export default function InviteUserModal({ onClose }: Props) {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({ name: '', email: '', jobTitle: '' })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await inviteUserAction({
        name: form.name,
        email: form.email,
        jobTitle: form.jobTitle || undefined,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setTimeout(onClose, 2000)
      }
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 animate-fade-in-up shadow-2xl"
        style={{ background: 'rgb(var(--surface-1))', border: '1px solid rgb(var(--glass-border))' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgb(99 102 241 / 0.15)', border: '1px solid rgb(99 102 241 / 0.3)' }}
            >
              <UserPlus className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-bold text-white">Convidar Membro</h2>
              <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>O convite será enviado por e-mail</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ color: 'rgb(var(--text-muted))' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="font-semibold text-white">Convite enviado!</p>
            <p className="text-sm mt-1" style={{ color: 'rgb(var(--text-muted))' }}>
              {form.name} receberá um e-mail com o link de acesso.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
                Nome completo *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgb(var(--text-muted))' }} />
                <input
                  type="text"
                  required
                  placeholder="Ex: João Silva"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  className="input-field pl-9"
                />
              </div>
            </div>

            {/* E-mail */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
                E-mail corporativo *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgb(var(--text-muted))' }} />
                <input
                  type="email"
                  required
                  placeholder="joao@empresa.com"
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  className="input-field pl-9"
                />
              </div>
            </div>

            {/* Cargo */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
                Cargo (opcional)
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgb(var(--text-muted))' }} />
                <input
                  type="text"
                  placeholder="Ex: Vendedor Sênior"
                  value={form.jobTitle}
                  onChange={(e) => setForm(f => ({ ...f, jobTitle: e.target.value }))}
                  className="input-field pl-9"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-rose-400 text-center">{error}</p>
            )}

            {/* Footer */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{ background: 'rgb(var(--surface-2))', color: 'rgb(var(--text-secondary))' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="btn-gradient flex-1 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin relative z-10" /><span>Enviando...</span></>
                ) : (
                  <><UserPlus className="w-4 h-4 relative z-10" /><span>Enviar Convite</span></>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
