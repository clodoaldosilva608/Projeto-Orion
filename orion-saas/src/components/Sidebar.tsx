'use client'

import { useState } from 'react'
import {
  LayoutDashboard, Users, FolderKanban, Boxes, KeyRound, CreditCard,
  Repeat, Tag, TicketPercent, GitBranch, Hammer, Rocket, Flag,
  Bug, Bot, Cpu, Brain, Gauge, Server, MessageSquare, BookOpen,
  ShieldCheck, Settings, ScrollText, ChevronLeft, Sparkles
} from 'lucide-react'

const SECTIONS = [
  {
    title: 'Gerenciamento',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, active: true },
      { label: 'Clientes', icon: Users },
      { label: 'Projetos', icon: FolderKanban },
      { label: 'Aplicações', icon: Boxes },
      { label: 'Licenças', icon: KeyRound },
      { label: 'Pagamentos', icon: CreditCard },
      { label: 'Assinaturas', icon: Repeat },
      { label: 'Planos', icon: Tag },
      { label: 'Cupons', icon: TicketPercent },
    ],
  },
  {
    title: 'Desenvolvimento',
    items: [
      { label: 'File de Projetos', icon: GitBranch },
      { label: 'Builds', icon: Hammer },
      { label: 'Deploys', icon: Rocket },
      { label: 'Releases', icon: Flag },
      { label: 'Anomalias', icon: Bug },
    ],
  },
  {
    title: 'IA e Automação',
    items: [
      { label: 'Agentes de IA', icon: Bot },
      { label: 'Jobs de IA', icon: Cpu },
      { label: 'Modelos', icon: Brain },
      { label: 'Consumo de IA', icon: Gauge },
      { label: 'Provedores', icon: Server },
    ],
  },
  {
    title: 'Suporte',
    items: [
      { label: 'Chatbots', icon: MessageSquare },
      { label: 'Base de Conhecimento', icon: BookOpen },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { label: 'Usuários', icon: Users },
      { label: 'Funções e Permissões', icon: ShieldCheck },
      { label: 'Configurações', icon: Settings },
      { label: 'Logs de Auditoria', icon: ScrollText },
    ],
  },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className="flex flex-col h-screen transition-all duration-300 flex-shrink-0"
      style={{
        width: collapsed ? '72px' : '260px',
        background: 'rgba(13, 15, 23, 0.8)',
        borderRight: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
          }}
        >
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-bold text-white text-base leading-tight tracking-tight">ORION</p>
            <p className="text-tiny" style={{ color: 'var(--text-muted)' }}>Platform Admin</p>
          </div>
        )}
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p
                className="text-tiny font-semibold uppercase tracking-wider px-3 mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <a
                    key={item.label}
                    href="#"
                    className={`sidebar-item ${item.active ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="icon" />
                    {!collapsed && <span>{item.label}</span>}
                  </a>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse button */}
      <div
        className="p-3"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-item w-full"
          style={collapsed ? { justifyContent: 'center' } : {}}
        >
          <ChevronLeft
            className="icon"
            style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}
          />
          {!collapsed && <span>Recolher menu</span>}
        </button>
      </div>
    </aside>
  )
}
