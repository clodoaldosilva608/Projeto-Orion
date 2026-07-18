'use client'

import { useEffect } from 'react'

/**
 * Registra o service worker (sw.js) em produção.
 * Em ambiente de desenvolvimento não registramos para evitar
 * cache agressivo que atrapalha o HMR.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    if (process.env.NODE_ENV !== 'production') return

    const onLoad = () => {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.warn('[SW] Falha ao registrar service worker:', err))
    }

    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])

  return null
}
