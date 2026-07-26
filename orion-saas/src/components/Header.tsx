'use client'

import { Search, Bell, Moon, Calendar, Menu } from 'lucide-react'

export function Header() {
  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <header
      className="flex items-center justify-between gap-4 px-6 py-3"
      style={{
        background: 'rgba(13, 15, 23, 0.8)',
        borderBottom: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Left: search */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        <button
          className="p-2 rounded-lg transition-colors hover:bg-white/5"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Buscar clientes, projetos, aplicações..."
            className="input-search"
          />
          <kbd
            className="absolute right-3 top-1/2 -translate-y-1/2 text-tiny font-mono px-1.5 py-0.5 rounded"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: actions + profile */}
      <div className="flex items-center gap-2">
        <button
          className="p-2 rounded-lg transition-colors hover:bg-white/5"
          style={{ color: 'var(--text-secondary)' }}
          title="Modo escuro"
        >
          <Moon className="w-5 h-5" />
        </button>

        <button
          className="p-2 rounded-lg transition-colors hover:bg-white/5 relative"
          style={{ color: 'var(--text-secondary)' }}
          title="Notificações"
        >
          <Bell className="w-5 h-5" />
          <span
            className="absolute top-1 right-1 w-4 h-4 rounded-full text-tiny font-bold text-white flex items-center justify-center pulse-dot"
            style={{ background: 'var(--danger)' }}
          >
            1
          </span>
        </button>

        <button
          className="p-2 rounded-lg transition-colors hover:bg-white/5 hidden sm:flex items-center gap-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Calendar className="w-4 h-4" />
          <span className="text-sm hidden md:inline">{today}</span>
        </button>

        <div className="w-px h-6 mx-1" style={{ background: 'var(--border-subtle)' }} />

        {/* User profile */}
        <button className="flex items-center gap-3 px-2 py-1.5 rounded-lg transition-colors hover:bg-white/5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: '2px solid rgba(255,255,255,0.1)',
            }}
          >
            AO
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-white leading-tight">Admin Orion</p>
            <p className="text-tiny" style={{ color: 'var(--text-muted)' }}>Super Administrador</p>
          </div>
        </button>
      </div>
    </header>
  )
}
