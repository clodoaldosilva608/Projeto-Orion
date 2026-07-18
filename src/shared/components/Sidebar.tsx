'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/modules/auth/services/auth.actions'
import {
  LayoutDashboard,
  Target,
  BarChart3,
  Trophy,
  Megaphone,
  Bell,
  Users,
  Building2,
  Settings,
  LogOut,
  Zap,
  ChevronDown,
  CheckCircle2,
  ScrollText,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  {
    label: 'Principal',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/metas', label: 'Metas', icon: Target },
      { href: '/resultados', label: 'Resultados', icon: BarChart3 },
      { href: '/ranking', label: 'Ranking', icon: Trophy },
      { href: '/campanhas', label: 'Campanhas', icon: Megaphone },
    ],
  },
  {
    label: 'Gestão',
    items: [
      { href: '/equipe', label: 'Equipe', icon: Users },
      { href: '/notificacoes', label: 'Notificações', icon: Bell },
      { href: '/indicadores', label: 'Indicadores', icon: BarChart3 },
      { href: '/aprovacoes', label: 'Aprovações', icon: CheckCircle2 },
      { href: '/auditoria', label: 'Auditoria', icon: ScrollText },
    ],
  },
  {
    label: 'Administração',
    items: [
      { href: '/empresa', label: 'Empresa', icon: Building2 },
      { href: '/configuracoes', label: 'Configurações', icon: Settings },
    ],
  },
]

interface SidebarProps {
  user?: { name?: string; email?: string }
  company?: { name?: string }
}

export function Sidebar({ user, company }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className="flex flex-col h-full transition-all duration-300"
      style={{
        width: collapsed ? '72px' : '240px',
        background: 'rgb(var(--surface-1))',
        borderRight: '1px solid rgb(var(--glass-border))',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: '1px solid rgb(var(--glass-border))' }}>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
          style={{ background: 'linear-gradient(135deg, rgb(99 102 241), rgb(168 85 247))' }}
        >
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-bold text-white text-sm leading-tight">Orion</p>
            <p className="text-xs truncate" style={{ color: 'rgb(var(--text-muted))' }}>
              {company?.name ?? 'Plataforma'}
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        {navItems.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-xs font-semibold uppercase tracking-wider px-2 mb-2" style={{ color: 'rgb(var(--text-muted))' }}>
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-3" style={{ borderTop: '1px solid rgb(var(--glass-border))' }}>
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2" style={{ background: 'rgb(var(--glass-bg))' }}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, rgb(99 102 241), rgb(168 85 247))' }}
            >
              {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name ?? 'Usuário'}</p>
              <p className="text-xs truncate" style={{ color: 'rgb(var(--text-muted))' }}>{user?.email ?? ''}</p>
            </div>
          </div>
        )}
        <form action={logoutAction}>
          <button
            type="submit"
            className={`sidebar-item w-full ${collapsed ? 'justify-center' : ''} hover:text-rose-400`}
            title={collapsed ? 'Sair' : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>
        </form>
      </div>
    </aside>
  )
}
