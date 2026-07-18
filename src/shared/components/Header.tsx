'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Search } from 'lucide-react'
import Link from 'next/link'

interface HeaderProps {
  title?: string
  unreadCount?: number
}

export function Header({ title, unreadCount = 0 }: HeaderProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (q) router.push(`/busca?q=${encodeURIComponent(q)}`)
  }

  return (
    <header
      className="h-16 flex items-center gap-4 px-6 flex-shrink-0"
      style={{
        background: 'rgb(var(--surface-1))',
        borderBottom: '1px solid rgb(var(--glass-border))',
      }}
    >
      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h2 className="text-base font-semibold text-white truncate">{title ?? 'Dashboard'}</h2>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgb(var(--text-muted))' }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar..."
          aria-label="Buscar"
          className="orion-input pl-9 pr-3 py-2 text-sm"
          style={{ width: '220px', borderRadius: '10px' }}
        />
      </form>

      {/* Notifications Bell */}
      <Link
        href="/notificacoes"
        className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 flex-shrink-0"
        style={{ background: 'rgb(var(--glass-bg))', border: '1px solid rgb(var(--glass-border))', color: 'rgb(var(--text-secondary))' }}
        title="Notificações"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-white font-bold"
            style={{
              background: 'rgb(var(--orion-rose))',
              fontSize: '10px',
              padding: '0 4px',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Link>
    </header>
  )
}
