'use client'

import { Bell, Search, Moon, Sun } from 'lucide-react'

interface HeaderProps {
  title?: string
}

export function Header({ title }: HeaderProps) {
  return (
    <header
      className="h-16 flex items-center gap-4 px-6 flex-shrink-0"
      style={{
        background: 'rgb(var(--surface-1))',
        borderBottom: '1px solid rgb(var(--glass-border))',
      }}
    >
      {/* Page title */}
      <div className="flex-1">
        <h2 className="text-base font-semibold text-white">{title ?? 'Dashboard'}</h2>
      </div>

      {/* Search */}
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgb(var(--text-muted))' }} />
        <input
          type="text"
          placeholder="Buscar..."
          className="orion-input pl-9 py-2 text-sm"
          style={{ width: '220px', borderRadius: '10px' }}
        />
      </div>

      {/* Notifications */}
      <button
        className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all"
        style={{ background: 'rgb(var(--glass-bg))', border: '1px solid rgb(var(--glass-border))', color: 'rgb(var(--text-secondary))' }}
      >
        <Bell className="w-4 h-4" />
        <span
          className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
          style={{ background: 'rgb(var(--orion-rose))' }}
        />
      </button>
    </header>
  )
}
