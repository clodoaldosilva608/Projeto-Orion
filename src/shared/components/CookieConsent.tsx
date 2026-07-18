'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'orion-lgpd-accepted'

type ConsentValue = 'accepted' | 'rejected'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) queueMicrotask(() => setVisible(true))
    } catch {
      // Sem acesso ao localStorage: mostra o banner por segurança
      queueMicrotask(() => setVisible(true))
    }
  }, [])

  function persist(value: ConsentValue) {
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      /* ignore */
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4">
      <div
        className="glass-card w-full max-w-3xl rounded-2xl p-4 shadow-2xl sm:p-5"
        style={{ borderColor: 'rgb(var(--glass-border))' }}
        role="dialog"
        aria-label="Consentimento de cookies e LGPD"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
            Usamos cookies e tratamos dados pessoais para operar a plataforma, melhorar a
            experiência e cumprir a LGPD. Ao continuar, você concorda com nossa{' '}
            <Link
              href="/privacidade"
              className="font-medium underline"
              style={{ color: 'rgb(var(--orion-indigo))' }}
            >
              Política de Privacidade
            </Link>
            .
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => persist('rejected')}
              className="rounded-lg px-3 py-2 text-sm font-medium transition-opacity hover:opacity-80"
              style={{ color: 'rgb(var(--text-muted))' }}
            >
              Recusar
            </button>
            <Link
              href="/privacidade"
              className="rounded-lg px-3 py-2 text-sm font-medium transition-opacity hover:opacity-80"
              style={{ color: 'rgb(var(--text-muted))' }}
            >
              Saiba mais
            </Link>
            <button
              type="button"
              onClick={() => persist('accepted')}
              className="btn-gradient rounded-lg px-4 py-2 text-sm font-semibold text-white"
            >
              Aceitar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
