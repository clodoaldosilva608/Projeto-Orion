'use client'

/**
 * Componentes adicionais do Orion Admin
 * - Notifications Panel (drawer)
 * - Roadmap Visualizer
 * - Version History
 * - Business Rules Validator
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, X, CheckCircle2, Clock, AlertTriangle, Rocket, GitBranch,
  Layers, Users, Star, Crown, Globe, Store, Smartphone, Cloud,
  RefreshCw, Shield, Zap, FileText, Lock, ChevronRight, AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

// =====================================================
// 1. NOTIFICATIONS PANEL (Drawer)
// Conforme Doc 29, Seção 8 — Suporte > notificações
// =====================================================

type NotificationItem = {
  id: string
  title: string
  message: string
  type: string
  priority: string
  read: boolean
  createdAt: Date
}

export function NotificationsPanel({
  open,
  onClose,
  notifications,
  onMarkAllRead,
  onMarkRead,
}: {
  open: boolean
  onClose: () => void
  notifications: NotificationItem[]
  onMarkAllRead: () => void
  onMarkRead: (id: string) => void
}) {
  const unreadCount = notifications.filter(n => !n.read).length

  const priorityConfig: Record<string, { color: string; bg: string }> = {
    urgent: { color: 'bg-red-500', bg: 'bg-red-50' },
    high: { color: 'bg-amber-500', bg: 'bg-amber-50' },
    normal: { color: 'bg-blue-500', bg: 'bg-blue-50' },
    low: { color: 'bg-slate-400', bg: 'bg-slate-50' },
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-[90]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-[100] w-full max-w-sm h-full bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-slate-500" />
                <h2 className="text-sm font-semibold text-slate-900">Notificações</h2>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-[10px] h-5 px-1.5">{unreadCount}</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={onMarkAllRead}>
                    Marcar todas como lidas
                  </Button>
                )}
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {notifications.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">Nenhuma notificação</p>
                </div>
              )}
              {notifications.map((n) => {
                const config = priorityConfig[n.priority] || priorityConfig.normal
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                      n.read ? 'bg-white hover:bg-slate-50' : `${config.bg} border border-slate-100`
                    }`}
                    onClick={() => !n.read && onMarkRead(n.id)}
                  >
                    <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${config.color} ${!n.read ? 'animate-pulse' : 'opacity-30'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs ${n.read ? 'text-slate-500' : 'text-slate-900 font-medium'}`}>{n.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString('pt-BR')}</p>
                    </div>
                    {!n.read && <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />}
                  </div>
                )
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// =====================================================
// 2. ROADMAP VISUALIZER
// Conforme Doc 29, Seção 21
// =====================================================

const ROADMAP_ITEMS = [
  { phase: 'v1.0', title: 'Plataforma Base', status: 'done', items: ['Clientes', 'Aplicações', 'Licenças', 'Pagamentos', 'Monitoramento'], icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
  { phase: 'v2.0', title: 'IA & Marketplace', status: 'in-progress', items: ['Desenvolvimento assistido por IA', 'Marketplace de aplicações', 'Múltiplos tipos de licença'], icon: Clock, color: 'text-blue-600 bg-blue-50' },
  { phase: 'v3.0', title: 'Expansão', status: 'planned', items: ['Revendedores', 'Afiliados', 'White-label'], icon: Layers, color: 'text-purple-600 bg-purple-50' },
  { phase: 'v4.0', title: 'Multi-tenant', status: 'planned', items: ['Multiempresa', 'Publicação em lojas de apps', 'Gerenciamento remoto'], icon: Globe, color: 'text-amber-600 bg-amber-50' },
  { phase: 'v5.0', title: 'OTA & Automação', status: 'planned', items: ['Atualização OTA', 'Automação completa', 'BI avançado'], icon: Rocket, color: 'text-red-600 bg-red-50' },
]

export function RoadmapVisualizer() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
          <Rocket className="h-4 w-4 text-slate-500" />
          Roadmap Futuro
        </CardTitle>
        <CardDescription className="text-xs">Conforme Documento 29, Seção 21 — Visão de longo prazo</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ROADMAP_ITEMS.map((item, index) => {
            const Icon = item.icon
            return (
              <div key={item.phase} className="flex gap-4">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${item.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {index < ROADMAP_ITEMS.length - 1 && (
                    <div className={`w-0.5 h-full min-h-[40px] ${item.status === 'done' ? 'bg-emerald-200' : 'bg-slate-200'}`} />
                  )}
                </div>
                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px] font-mono">{item.phase}</Badge>
                    <span className="text-sm font-medium text-slate-900">{item.title}</span>
                    {item.status === 'done' && (
                      <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">Concluído</Badge>
                    )}
                    {item.status === 'in-progress' && (
                      <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">Em Progresso</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.items.map(i => (
                      <span key={i} className="text-[11px] text-slate-500 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100">{i}</span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// =====================================================
// 3. VERSION HISTORY
// Conforme Doc 29, Seção 22
// =====================================================

const VERSION_HISTORY = [
  { version: '1.0.0', date: 'Julho/2026', description: 'Primeira versão oficial da Jornada do Cliente e Ciclo de Vida das Licenças da Plataforma Orion, consolidando os fluxos comerciais, técnicos e operacionais definidos para o ecossistema.', type: 'major' },
]

export function VersionHistory() {
  const typeConfig: Record<string, { color: string; label: string }> = {
    major: { color: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Major' },
    minor: { color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Minor' },
    patch: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Patch' },
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-500" />
          Histórico de Versões
        </CardTitle>
        <CardDescription className="text-xs">Conforme Documento 29, Seção 22</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {VERSION_HISTORY.map(v => {
            const config = typeConfig[v.type] || typeConfig.patch
            return (
              <div key={v.version} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100">
                <Badge variant="outline" className={`text-[10px] font-mono ${config.color}`}>{config.label}</Badge>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-medium text-slate-900">v{v.version}</span>
                    <span className="text-xs text-slate-400">{v.date}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{v.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// =====================================================
// 4. BUSINESS RULES VALIDATOR
// Conforme Doc 29, Seção 18
// =====================================================

const BUSINESS_RULES = [
  { id: 'BR-01', rule: 'Nenhuma aplicação será iniciada sem pagamento confirmado', status: 'warning', detail: 'Validação necessária no formulário de criação' },
  { id: 'BR-02', rule: 'Toda licença deverá estar vinculada a um cliente', status: 'success', detail: 'Validado no formulário de licença' },
  { id: 'BR-03', rule: 'Toda aplicação deverá possuir uma licença válida', status: 'warning', detail: '2 aplicações sem licença vinculada' },
  { id: 'BR-04', rule: 'Downloads deverão ser autenticados', status: 'success', detail: 'Autenticação obrigatória implementada' },
  { id: 'BR-05', rule: 'Links de download serão temporários e protegidos', status: 'success', detail: 'URL assinada com expiração automática' },
  { id: 'BR-06', rule: 'Toda renovação deverá ocorrer automaticamente quando habilitada', status: 'success', detail: 'Auto-renovação ativa para 3 licenças' },
  { id: 'BR-07', rule: 'Todas as ações críticas deverão ser auditadas', status: 'success', detail: 'Auditoria automática em todas as mutations' },
  { id: 'BR-08', rule: 'O cliente poderá acompanhar todo o ciclo de vida pela Dashboard', status: 'pending', detail: 'Dashboard do cliente pendente' },
]

export function BusinessRulesValidator() {
  const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; label: string; bg: string }> = {
    success: { icon: CheckCircle2, color: 'text-emerald-600', label: 'Conforme', bg: 'bg-emerald-50' },
    warning: { icon: AlertTriangle, color: 'text-amber-600', label: 'Atenção', bg: 'bg-amber-50' },
    pending: { icon: Clock, color: 'text-slate-400', label: 'Pendente', bg: 'bg-slate-50' },
  }

  const successCount = BUSINESS_RULES.filter(r => r.status === 'success').length

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-slate-500" />
              Regras de Negócio
            </CardTitle>
            <CardDescription className="text-xs">Conforme Documento 29, Seção 18 — {successCount}/{BUSINESS_RULES.length} regras conformes</CardDescription>
          </div>
          <Badge variant="outline" className={`text-xs ${successCount === BUSINESS_RULES.length ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
            {successCount === BUSINESS_RULES.length ? 'Totalmente Conforme' : 'Parcialmente Conforme'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {BUSINESS_RULES.map(rule => {
          const config = statusConfig[rule.status]
          const Icon = config.icon
          return (
            <div key={rule.id} className={`flex items-start gap-3 p-2.5 rounded-lg ${config.bg}`}>
              <Icon className={`h-4 w-4 flex-shrink-0 mt-0.5 ${config.color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">{rule.id}</span>
                  <p className="text-xs font-medium text-slate-700">{rule.rule}</p>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{rule.detail}</p>
              </div>
              <Badge variant="outline" className={`text-[9px] ${config.bg} ${config.color} border-transparent`}>{config.label}</Badge>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

// =====================================================
// 5. EXPORT UTILITY
// =====================================================

export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) return
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => `"${row[h] ?? ''}"`).join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function useExport() {
  return { exportToCSV }
}
