'use client'

import { useState, useEffect, useRef } from 'react'
import {
  LayoutDashboard,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Megaphone,
  Bell,
  FileBarChart,
  ShieldCheck,
  Settings,
  ChevronLeft,
  LogOut,
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null, color: 'rgb(99 102 241)' },
  { id: 'metas', label: 'Metas', icon: Target, badge: '3', color: 'rgb(168 85 247)' },
  { id: 'resultados', label: 'Resultados', icon: TrendingUp, badge: null, color: 'rgb(16 185 129)' },
  { id: 'ranking', label: 'Ranking', icon: Trophy, badge: null, color: 'rgb(245 158 11)' },
  { id: 'equipe', label: 'Equipe', icon: Users, badge: '12', color: 'rgb(6 182 212)' },
  { id: 'campanhas', label: 'Campanhas', icon: Megaphone, badge: null, color: 'rgb(244 63 94)' },
  { id: 'notificacoes', label: 'Notificações', icon: Bell, badge: '5', color: 'rgb(99 102 241)' },
  { id: 'auditoria', label: 'Auditoria', icon: FileBarChart, badge: null, color: 'rgb(120 120 140)' },
  { id: 'admin', label: 'Administração', icon: ShieldCheck, badge: null, color: 'rgb(168 85 247)' },
  { id: 'configuracoes', label: 'Configurações', icon: Settings, badge: null, color: 'rgb(120 120 140)' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [active, setActive] = useState('dashboard')
  const [pulse, setPulse] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pulseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sempre inicia no estado expandido (clássico). O usuário pode recolher
  // durante a sessão, mas ao recarregar a página volta ao estado padrão.
  useEffect(() => {
    setMounted(true)
  }, [])

  // Atalho de teclado: Ctrl+B para toggle (mesmo padrão do VS Code, Slack, etc.)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggle() {
    setCollapsed((c) => !c)
    // Feedback visual: pulsa o botão de toggle
    setPulse(true)
    if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current)
    pulseTimeoutRef.current = setTimeout(() => setPulse(false), 600)
  }

  // Evita hydration mismatch: renderiza estado expandido até montar
  const isCollapsed = mounted ? collapsed : false

  return (
    <aside
      className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}
      aria-expanded={!isCollapsed}
    >
      {/* Botão de toggle flutuante */}
      <button
        onClick={toggle}
        className={`toggle-btn ${isCollapsed ? 'toggle-btn-rotated' : ''} ${pulse ? 'toggle-btn-pulse' : ''}`}
        aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
        title={isCollapsed ? 'Expandir (Ctrl+B)' : 'Recolher (Ctrl+B)'}
      >
        <ChevronLeft className="toggle-btn-icon" />
      </button>

      {/* Logo / Brand */}
      <div className="logo-area">
        <div className="logo-icon">O</div>
        <div className="logo-text">
          <span className="text-base font-bold text-white">Orion</span>
          <span className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
            Empresa Demo
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-1" style={{ flex: 1 }}>
        {NAV_ITEMS.map((item, idx) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <div
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
              style={{
                animation: mounted ? `fadeInUp 0.4s ease-out ${idx * 0.04}s both` : undefined,
              }}
            >
              <Icon
                className="nav-item-icon"
                style={{ color: isActive ? item.color : 'rgb(var(--text-muted))' }}
              />
              <span className="nav-item-label flex-1">{item.label}</span>
              {item.badge && (
                <span
                  className="nav-item-label badge badge-info"
                  style={{ padding: '0.125rem 0.5rem' }}
                >
                  {item.badge}
                </span>
              )}
              {/* Tooltip quando colapsada */}
              <span className="nav-tooltip">{item.label}</span>
            </div>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="user-footer">
        <div className="user-avatar">AD</div>
        <div className="user-info">
          <p className="text-sm font-semibold text-white truncate">Admin Demo</p>
          <p className="text-xs truncate" style={{ color: 'rgb(var(--text-muted))' }}>
            admin@orion.local
          </p>
        </div>
        <button
          className="nav-item-label p-1.5 rounded-lg transition-colors hover:bg-white/5"
          style={{ color: 'rgb(var(--text-muted))' }}
          title="Sair"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  )
}
