'use client'

/**
 * Orion Platform — Enterprise Command Center
 * 
 * Design inspirado em Linear, Vercel, Stripe e Retool.
 * Conforme Documento 29: Customer Journey and License Lifecycle.
 */
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, AppWindow, Key, Download, CreditCard, LifeBuoy,
  Bell, Menu, X, Zap, Shield, ChevronRight, ChevronDown, TrendingUp,
  TrendingDown, Clock, CheckCircle2, FileText, ExternalLink, Search,
  Settings, Users, DollarSign, Activity, Server, Cpu, HardDrive,
  AlertTriangle, ArrowUpRight, ArrowDownRight, Eye, RefreshCw, Filter,
  Calendar, Building2, Star, Rocket, Plus, MoreVertical, Command,
  CircleDot, Wifi, Database, Cloud, GitBranch, Layers, Crown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  RevenueChart, AppStatusChart, PaymentMethodsChart, Sparkline, ProgressRing,
} from './orion-charts'
import {
  AppStatusBadge, LicenseStatusBadge, PlanBadge, TicketStatusBadge,
  PriorityBadge, PaymentStatusIcon, DownloadStatusIcon, ComplexityBadge,
} from './orion-badges'
import {
  TrialBanner, CustomerJourneyTracker, SecurityPanel, ModuleIntegrationStatus,
  AuditLogViewer, AppLifecycleVisualizer, LicenseLifecycleVisualizer,
  DevelopmentTracker, DistributionDetails, NewProjectForm,
} from './orion-features'
import type { DashboardData } from '@/lib/orion-data'

type ViewType = 'dashboard' | 'applications' | 'licenses' | 'downloads' | 'financial' | 'support' | 'admin'

// =====================================================
// MAIN SHELL
// =====================================================

export function OrionDashboard({ data }: { data: DashboardData }) {
  const [activeView, setActiveView] = useState<ViewType>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [commandOpen, setCommandOpen] = useState(false)

  const menuGroups: Array<{
    id: string
    label: string
    items: Array<{ id: ViewType; label: string; icon: typeof AppWindow; badge?: number }>
  }> = [
    {
      id: 'overview',
      label: 'Visão Geral',
      items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }],
    },
    {
      id: 'management',
      label: 'Gestão',
      items: [
        { id: 'applications', label: 'Aplicações', icon: AppWindow, badge: data.applications.length },
        { id: 'licenses', label: 'Licenças', icon: Key, badge: data.licenses.length },
        { id: 'downloads', label: 'Downloads', icon: Download },
      ],
    },
    {
      id: 'operations',
      label: 'Operações',
      items: [
        { id: 'financial', label: 'Financeiro', icon: CreditCard },
        { id: 'support', label: 'Suporte', icon: LifeBuoy, badge: data.stats.openTickets },
        { id: 'admin', label: 'Central de Comando', icon: Server },
      ],
    },
  ]

  const currentViewLabel = menuGroups
    .flatMap((g) => g.items)
    .find((item) => item.id === activeView)?.label || 'Dashboard'

  const toggleGroup = (id: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="min-h-screen bg-[#FAFAFB] flex">
      {/* ============ SIDEBAR ============ */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:sticky top-0 z-50 w-[260px] h-screen bg-[#0A0A0B] text-white flex flex-col transition-transform duration-300`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] shadow-lg shadow-blue-500/20">
              <Zap className="h-4 w-4 text-white" fill="white" />
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#0A0A0B]" />
            </div>
            <div>
              <p className="text-[15px] font-bold tracking-tight leading-none">Orion</p>
              <p className="text-[10px] text-white/40 leading-none mt-0.5">SaaS Platform</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden text-white/40 hover:text-white hover:bg-white/5" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Customer Info Card */}
        <div className="px-3 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <Avatar className="h-9 w-9 border border-white/10">
              <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-800 text-white text-xs font-medium">
                {data.customer.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{data.customer.name}</p>
              <p className="text-[10px] text-white/40 truncate">{data.customer.company}</p>
            </div>
            <div className="flex items-center gap-1">
              {data.customer.mfaEnabled ? (
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Shield className="h-3.5 w-3.5 text-white/20" />
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-1">
          {menuGroups.map((group) => {
            const isCollapsed = collapsedGroups[group.id]
            return (
              <div key={group.id} className="mb-1">
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold text-white/30 uppercase tracking-wider hover:text-white/50 transition-colors"
                >
                  <ChevronDown className={`h-3 w-3 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                  {group.label}
                </button>
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden space-y-0.5 mt-0.5"
                    >
                      {group.items.map((item) => {
                        const Icon = item.icon
                        const isActive = activeView === item.id
                        return (
                          <button
                            key={item.id}
                            onClick={() => { setActiveView(item.id); setSidebarOpen(false) }}
                            className={`group w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all relative ${
                              isActive
                                ? 'bg-white/[0.08] text-white'
                                : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                            }`}
                          >
                            {isActive && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] bg-blue-500 rounded-r-full" />
                            )}
                            <Icon className={`h-4 w-4 ${isActive ? 'text-blue-400' : 'text-white/40 group-hover:text-white/60'}`} />
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.badge !== undefined && item.badge > 0 && (
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                                isActive ? 'bg-blue-500 text-white' : 'bg-white/[0.06] text-white/40'
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </nav>

        {/* System Status Footer */}
        <div className="px-3 py-3 border-t border-white/[0.06]">
          <div className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <div className="absolute inset-0 h-2 w-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
              </div>
              <span className="text-[10px] text-white/40">Sistema Operacional</span>
            </div>
            <span className="text-[10px] text-white/30 font-mono">99.9%</span>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ============ MAIN ============ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-30 flex items-center px-4 lg:px-6 gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-4 w-4" />
          </Button>

          {/* Breadcrumb */}
          <div className="hidden md:flex items-center gap-2 text-[13px]">
            <span className="text-slate-400">Orion</span>
            <ChevronRight className="h-3 w-3 text-slate-300" />
            <span className="font-medium text-slate-900">{currentViewLabel}</span>
          </div>

          {/* Command Palette Trigger */}
          <button
            onClick={() => setCommandOpen(true)}
            className="ml-auto hidden md:flex items-center gap-2 w-56 lg:w-64 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-xs text-slate-500 transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Buscar...</span>
            <kbd className="ml-auto text-[10px] font-mono bg-white border border-slate-200 rounded px-1 py-0.5">⌘K</kbd>
          </button>

          <div className="ml-auto md:ml-0 flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-8 w-8">
                    <Bell className="h-4 w-4 text-slate-500" />
                    {data.stats.unreadNotifications > 0 && (
                      <span className="absolute top-0.5 right-0.5 h-3.5 w-3.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold">
                        {data.stats.unreadNotifications}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notificações</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4 text-slate-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Configurações</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="h-5 mx-1" />

            <Avatar className="h-7 w-7 ring-1 ring-slate-200">
              <AvatarFallback className="bg-slate-900 text-white text-[11px] font-medium">
                {data.customer.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {activeView === 'dashboard' && <OverviewView data={data} />}
              {activeView === 'applications' && <ApplicationsView data={data} />}
              {activeView === 'licenses' && <LicensesView data={data} />}
              {activeView === 'downloads' && <DownloadsView data={data} />}
              {activeView === 'financial' && <FinancialView data={data} />}
              {activeView === 'support' && <SupportView data={data} />}
              {activeView === 'admin' && <AdminView data={data} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        menuGroups={menuGroups}
        onSelect={(view) => { setActiveView(view); setCommandOpen(false) }}
      />
    </div>
  )
}

// =====================================================
// COMMAND PALETTE
// =====================================================

function CommandPalette({
  open,
  onClose,
  menuGroups,
  onSelect,
}: {
  open: boolean
  onClose: () => void
  menuGroups: Array<{ label: string; items: Array<{ id: ViewType; label: string; icon: typeof AppWindow }> }>
  onSelect: (view: ViewType) => void
}) {
  const [query, setQuery] = useState('')

  const allItems = menuGroups.flatMap((g) => g.items.map((i) => ({ ...i, group: g.label })))
  const filtered = query
    ? allItems.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
    : allItems

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar páginas, ações..."
                className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400"
              />
              <kbd className="text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5">ESC</kbd>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-8">Nenhum resultado encontrado</p>
              )}
              {filtered.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 transition-colors text-left"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                      <Icon className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{item.label}</p>
                      <p className="text-[11px] text-slate-400">{item.group}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                  </button>
                )
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// =====================================================
// VIEW: OVERVIEW
// =====================================================

function OverviewView({ data }: { data: DashboardData }) {
  const revenueData = [
    { month: 'Fev', revenue: 42000 },
    { month: 'Mar', revenue: 55000 },
    { month: 'Abr', revenue: 48000 },
    { month: 'Mai', revenue: 72000 },
    { month: 'Jun', revenue: 78000 },
    { month: 'Jul', revenue: data.stats.totalPaid },
  ]

  const appStatusData = [
    { name: 'Publicadas', value: data.stats.publishedApps, color: '#10B981' },
    { name: 'Em Desenvolvimento', value: data.applications.filter(a => a.status === 'development').length, color: '#3B82F6' },
    { name: 'Em Testes', value: data.applications.filter(a => a.status === 'testing').length, color: '#F59E0B' },
    { name: 'Homologação', value: data.applications.filter(a => a.status === 'homologation').length, color: '#8B5CF6' },
    { name: 'Rascunho', value: data.applications.filter(a => a.status === 'draft').length, color: '#64748B' },
  ].filter(item => item.value > 0)

  const paymentMethodsData = [
    { method: 'card', label: 'Cartão', amount: data.payments.filter(p => p.method === 'card' && p.status === 'succeeded').reduce((s, p) => s + p.amount, 0) },
    { method: 'pix', label: 'PIX', amount: data.payments.filter(p => p.method === 'pix' && p.status === 'succeeded').reduce((s, p) => s + p.amount, 0) },
    { method: 'boleto', label: 'Boleto', amount: data.payments.filter(p => p.method === 'boleto' && p.status === 'succeeded').reduce((s, p) => s + p.amount, 0) },
  ].filter(item => item.amount > 0)

  return (
    <div className="space-y-6">
      {/* Trial Banner - Conforme Doc 29, Seção 12 */}
      {data.trial && data.trial.isActive && (
        <TrialBanner daysLeft={data.trial.daysLeft} trialEndsAt={data.trial.endsAt!} />
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Bem-vindo de volta, {data.customer.name.split(' ')[0]}. Aqui está o resumo da sua conta.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs h-8">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            Últimos 30 dias
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-8">
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={AppWindow}
          label="Aplicações"
          value={data.stats.totalApps.toString()}
          sub={`${data.stats.publishedApps} publicadas`}
          trend={12}
          sparklineData={[2, 3, 3, 4, 5, 5, 6]}
          color="blue"
        />
        <KpiCard
          icon={Key}
          label="Licenças Ativas"
          value={data.stats.activeLicenses.toString()}
          sub={`${data.stats.trialLicenses} em trial`}
          trend={5}
          sparklineData={[1, 1, 2, 2, 3, 3, 4]}
          color="emerald"
        />
        <KpiCard
          icon={DollarSign}
          label="Total Investido"
          value={formatCurrency(data.stats.totalPaid)}
          sub={`${data.stats.pendingPayments} pendências`}
          trend={18}
          sparklineData={[42, 55, 48, 72, 78, 96]}
          color="purple"
        />
        <KpiCard
          icon={LifeBuoy}
          label="Chamados Abertos"
          value={data.stats.openTickets.toString()}
          sub={`${data.stats.unreadNotifications} notificações`}
          trend={-8}
          sparklineData={[5, 4, 6, 3, 4, 2, 3]}
          color="amber"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <RevenueChart data={revenueData} />
        <AppStatusChart data={appStatusData} />
      </div>

      {/* Charts Row 2 + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Apps */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-[15px] font-semibold">Aplicações Recentes</CardTitle>
              <CardDescription className="text-xs">Atualizações mais recentes</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-slate-500 h-7">
              Ver todas
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.applications.slice(0, 4).map((app) => (
              <div key={app.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all group cursor-pointer">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-slate-200 group-hover:to-slate-300 transition-colors">
                  <AppWindow className="h-5 w-5 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900 truncate">{app.name}</p>
                    <span className="text-[10px] font-mono text-slate-400">v{app.version}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{app.niche} • {app.complexity}</p>
                </div>
                <AppStatusBadge status={app.status} withIcon />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4 text-slate-500" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 max-h-[320px] overflow-y-auto">
            {data.notifications.slice(0, 6).map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-2.5 p-2.5 rounded-lg transition-colors cursor-pointer ${
                  n.read ? 'hover:bg-slate-50' : 'bg-blue-50/40 hover:bg-blue-50/60'
                }`}
              >
                <div className={`mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                  n.priority === 'urgent' ? 'bg-red-500' :
                  n.priority === 'high' ? 'bg-amber-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-[12px] ${n.read ? 'text-slate-600' : 'text-slate-900 font-medium'}`}>{n.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods + System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {paymentMethodsData.length > 0 && <PaymentMethodsChart data={paymentMethodsData} />}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-slate-500" />
              Saúde do Sistema
            </CardTitle>
            <CardDescription className="text-xs">Status dos serviços</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <SystemHealthItem icon={Server} label="API Gateway" status="operational" value="99.9%" />
            <SystemHealthItem icon={Cpu} label="Build Service" status="operational" value="100%" />
            <SystemHealthItem icon={HardDrive} label="Storage" status="operational" value="87% usado" />
            <SystemHealthItem icon={Shield} label="License Service" status="degraded" value="98.2%" />
          </CardContent>
        </Card>
      </div>

      {/* Row: Customer Journey + Security + Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <CustomerJourneyTracker currentStep={4} />
        <SecurityPanel mfaEnabled={data.customer.mfaEnabled} />
        <AuditLogViewer logs={data.auditLogs.map(log => ({ action: log.action, entity: log.entity, ipAddress: log.ipAddress, createdAt: log.createdAt }))} />
      </div>

      {/* Module Integration Status - Conforme Doc 29, Seção 19 */}
      <ModuleIntegrationStatus />
    </div>
  )
}

// =====================================================
// KPI CARD
// =====================================================

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  sparklineData,
  color,
}: {
  icon: typeof AppWindow
  label: string
  value: string
  sub: string
  trend: number
  sparklineData: number[]
  color: 'blue' | 'emerald' | 'purple' | 'amber'
}) {
  const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', chart: '#3B82F6', gradient: 'from-blue-500/10' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', chart: '#10B981', gradient: 'from-emerald-500/10' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', chart: '#8B5CF6', gradient: 'from-purple-500/10' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', chart: '#F59E0B', gradient: 'from-amber-500/10' },
  }
  const c = colorMap[color]
  const isPositiveTrend = trend > 0

  return (
    <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${c.gradient} to-transparent rounded-full -translate-y-12 translate-x-12 blur-2xl`} />
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.bg}`}>
            <Icon className={`h-5 w-5 ${c.text}`} />
          </div>
          <div className={`flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-md ${
            isPositiveTrend ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'
          }`}>
            {isPositiveTrend ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend)}%
          </div>
        </div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-[26px] font-bold text-slate-900 tracking-tight leading-none">{value}</p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-slate-500">{sub}</p>
        </div>
        <div className="mt-3 -mx-1">
          <Sparkline data={sparklineData} color={c.chart} height={32} />
        </div>
      </CardContent>
    </Card>
  )
}

// =====================================================
// SYSTEM HEALTH ITEM
// =====================================================

function SystemHealthItem({
  icon: Icon,
  label,
  status,
  value,
}: {
  icon: typeof Server
  label: string
  status: 'operational' | 'degraded' | 'down'
  value: string
}) {
  const statusConfig = {
    operational: { color: 'bg-emerald-500', label: 'Operacional', textColor: 'text-emerald-600' },
    degraded: { color: 'bg-amber-500', label: 'Degradado', textColor: 'text-amber-600' },
    down: { color: 'bg-red-500', label: 'Indisponível', textColor: 'text-red-600' },
  }
  const s = statusConfig[status]

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
        <Icon className="h-4 w-4 text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-700">{label}</p>
        <p className="text-[11px] text-slate-500">{value}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <div className={`h-2 w-2 rounded-full ${s.color} ${status === 'operational' ? 'animate-pulse' : ''}`} />
        <span className={`text-[11px] font-medium ${s.textColor}`}>{s.label}</span>
      </div>
    </div>
  )
}

// =====================================================
// VIEW: APPLICATIONS
// =====================================================

function ApplicationsView({ data }: { data: DashboardData }) {
  const [filter, setFilter] = useState<string>('all')

  const filteredApps = filter === 'all'
    ? data.applications
    : data.applications.filter(a => a.status === filter)

  const statusCounts = {
    all: data.applications.length,
    published: data.applications.filter(a => a.status === 'published').length,
    development: data.applications.filter(a => a.status === 'development').length,
    testing: data.applications.filter(a => a.status === 'testing').length,
    homologation: data.applications.filter(a => a.status === 'homologation').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Aplicações</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie todas as suas aplicações desenvolvidas na plataforma</p>
        </div>
        <Button size="sm" className="h-8">
          <Plus className="h-4 w-4 mr-1.5" />
          Solicitar Aplicação
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
        <FilterTab label="Todas" count={statusCounts.all} active={filter === 'all'} onClick={() => setFilter('all')} />
        <FilterTab label="Publicadas" count={statusCounts.published} active={filter === 'published'} onClick={() => setFilter('published')} />
        <FilterTab label="Em Desenvolvimento" count={statusCounts.development} active={filter === 'development'} onClick={() => setFilter('development')} />
        <FilterTab label="Em Testes" count={statusCounts.testing} active={filter === 'testing'} onClick={() => setFilter('testing')} />
        <FilterTab label="Homologação" count={statusCounts.homologation} active={filter === 'homologation'} onClick={() => setFilter('homologation')} />
      </div>

      {/* Applications Grid */}
      <div className="grid gap-3">
        {filteredApps.map((app) => (
          <Card key={app.id} className="hover:shadow-lg transition-all group">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white flex-shrink-0 shadow-md">
                  <AppWindow className="h-7 w-7" />
                  {app.status === 'published' && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{app.name}</h3>
                        <Badge variant="outline" className="text-[10px] font-mono">v{app.version}</Badge>
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">{app.description}</p>
                    </div>
                    <AppStatusBadge status={app.status} withIcon />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-3">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      {app.niche}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ComplexityBadge complexity={app.complexity} />
                    </span>
                    {app.publishedAt && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Publicada em {formatDate(app.publishedAt)}
                      </span>
                    )}
                    {app.artifactSize && (
                      <span className="flex items-center gap-1.5">
                        <HardDrive className="h-3.5 w-3.5" />
                        {formatFileSize(app.artifactSize)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4 text-slate-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Ver detalhes</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {app.status === 'published' && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4 text-slate-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Baixar</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* App Lifecycle Visualizer - Conforme Doc 29, Seção 5 */}
      {filteredApps.length > 0 && (
        <AppLifecycleVisualizer currentStatus={filteredApps[0].status} />
      )}

      {/* Development Process Tracker - Conforme Doc 29, Seção 7 */}
      {filteredApps.length > 0 && (
        <DevelopmentTracker currentStep={filteredApps[0].status === 'published' ? 9 : filteredApps[0].status === 'development' ? 4 : filteredApps[0].status === 'testing' ? 5 : filteredApps[0].status === 'homologation' ? 6 : 3} complexity={filteredApps[0].complexity} />
      )}

      {/* New Project Form - Conforme Doc 29, Seção 4, Etapa 5 */}
      <NewProjectForm />
    </div>
  )
}

function FilterTab({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
        active ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
      }`}
    >
      {label}
      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-slate-100'}`}>
        {count}
      </span>
    </button>
  )
}

// =====================================================
// VIEW: LICENSES
// =====================================================

function LicensesView({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Licenças</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie planos, validades e renovações</p>
        </div>
        <Button size="sm" className="h-8">
          <Key className="h-4 w-4 mr-1.5" />
          Adquirir Licença
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <ProgressRing value={75} size={48} strokeWidth={5} color="#10B981" />
            </div>
            <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider">Licenças Ativas</p>
            <p className="text-[26px] font-bold text-emerald-900 leading-none mt-1">{data.stats.activeLicenses}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs font-medium text-amber-700 uppercase tracking-wider">Em Trial</p>
            <p className="text-[26px] font-bold text-amber-900 leading-none mt-1">{data.stats.trialLicenses}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500 text-white shadow-lg shadow-purple-500/20">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs font-medium text-purple-700 uppercase tracking-wider">Valor Total</p>
            <p className="text-[26px] font-bold text-purple-900 leading-none mt-1">{formatCurrency(data.licenses.reduce((s, l) => s + l.price, 0))}</p>
          </CardContent>
        </Card>
      </div>

      {/* License Cards */}
      <div className="grid gap-3">
        {data.licenses.map((lic) => (
          <Card key={lic.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex items-center gap-3 lg:w-1/3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                    <Key className="h-5 w-5 text-slate-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-medium text-slate-900 truncate">{lic.licenseKey}</p>
                    <p className="text-xs text-slate-500 truncate">{lic.applicationName || 'Sem aplicação'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:flex-1">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Plano</p>
                    <PlanBadge plan={lic.plan} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Validade</p>
                    <p className="text-sm font-medium text-slate-900">{lic.duration} dias</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Usuários</p>
                    <p className="text-sm font-medium text-slate-900">{lic.maxUsers} máx</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Valor</p>
                    <p className="text-sm font-medium text-slate-900">{lic.price > 0 ? formatCurrency(lic.price) : 'Gratuito'}</p>
                  </div>
                </div>
                <div className="flex flex-col items-start lg:items-end gap-2">
                  <LicenseStatusBadge status={lic.status} />
                  <div className="flex items-center gap-2 text-xs">
                    {lic.endDate && (
                      <span className="text-slate-500">
                        {lic.status === 'active' ? 'Expira' : 'Expirou'}: <span className="font-medium text-slate-700">{formatDate(lic.endDate)}</span>
                      </span>
                    )}
                    {lic.autoRenew && lic.status === 'active' && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                        <RefreshCw className="h-2.5 w-2.5 mr-1" />
                        Auto-renovação
                      </Badge>
                    )}
                    {lic.trialEndsAt && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                        <Clock className="h-2.5 w-2.5 mr-1" />
                        Trial: {formatDate(lic.trialEndsAt)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* License Lifecycle Visualizer - Conforme Doc 29, Seção 6 */}
      {data.licenses.length > 0 && (
        <LicenseLifecycleVisualizer currentStatus={data.licenses[0].status} />
      )}
    </div>
  )
}

// =====================================================
// VIEW: DOWNLOADS
// =====================================================

function DownloadsView({ data }: { data: DashboardData }) {
  const publishedApps = data.applications.filter(a => a.status === 'published')
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Downloads</h1>
        <p className="text-sm text-slate-500 mt-1">Baixe aplicações e gerencie dispositivos autorizados</p>
      </div>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
            <Download className="h-4 w-4 text-slate-500" />
            Disponíveis para Download
          </CardTitle>
          <CardDescription className="text-xs">Aplicações publicadas e prontas para uso</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {publishedApps.map((app) => (
            <div key={app.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white">
                <AppWindow className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-900">{app.name}</p>
                  <Badge variant="outline" className="text-[10px] font-mono">v{app.version}</Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  {app.artifactSize && (
                    <span className="flex items-center gap-1">
                      <HardDrive className="h-3 w-3" />
                      {formatFileSize(app.artifactSize)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    SHA-256: {app.artifactHash?.substring(0, 16)}...
                  </span>
                </div>
              </div>
              <Button size="sm" className="group-hover:shadow-md transition-shadow">
                <Download className="h-4 w-4 mr-1.5" />
                Baixar
              </Button>
            </div>
          ))}
          {publishedApps.length === 0 && (
            <EmptyState icon={Download} title="Nenhuma aplicação disponível" description="Aplicações publicadas aparecerão aqui" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-500" />
            Histórico de Downloads
          </CardTitle>
          <CardDescription className="text-xs">Registro de todos os downloads realizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {data.downloads.map((dl) => (
              <div key={dl.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <DownloadStatusIcon status={dl.status} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900 truncate">{dl.applicationName}</p>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {dl.downloadToken.substring(0, 12)}...
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                    <span>{dl.downloadedAt ? `Baixado em ${formatDateTime(dl.downloadedAt)}` : 'Pendente'}</span>
                    {dl.ipAddress && <span>IP: {dl.ipAddress}</span>}
                    {dl.deviceInfo && <span className="truncate max-w-[200px]">{dl.deviceInfo}</span>}
                  </div>
                </div>
                <Badge variant="outline" className={`text-xs ${
                  dl.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  dl.status === 'expired' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                  'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {dl.status === 'completed' ? 'Concluído' : dl.status === 'expired' ? 'Expirado' : 'Pendente'}
                </Badge>
              </div>
            ))}
            {data.downloads.length === 0 && (
              <EmptyState icon={Clock} title="Nenhum download realizado" description="Seu histórico aparecerá aqui" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Distribution Details - Conforme Doc 29, Seção 10 */}
      {data.downloads.length > 0 && data.downloads[0].status === 'completed' && (
        <DistributionDetails download={data.downloads[0]} />
      )}
    </div>
  )
}

// =====================================================
// VIEW: FINANCIAL
// =====================================================

function FinancialView({ data }: { data: DashboardData }) {
  const paymentMethodsData = [
    { method: 'card', label: 'Cartão', amount: data.payments.filter(p => p.method === 'card' && p.status === 'succeeded').reduce((s, p) => s + p.amount, 0) },
    { method: 'pix', label: 'PIX', amount: data.payments.filter(p => p.method === 'pix' && p.status === 'succeeded').reduce((s, p) => s + p.amount, 0) },
    { method: 'boleto', label: 'Boleto', amount: data.payments.filter(p => p.method === 'boleto' && p.status === 'succeeded').reduce((s, p) => s + p.amount, 0) },
  ].filter(item => item.amount > 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Financeiro</h1>
          <p className="text-sm text-slate-500 mt-1">Pagamentos, notas fiscais e histórico de transações</p>
        </div>
        <Button variant="outline" size="sm" className="h-8">
          <FileText className="h-4 w-4 mr-1.5" />
          Baixar todas as notas
        </Button>
      </div>

      {/* Summary Cards with gradients */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-2xl" />
          <CardContent className="relative p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <DollarSign className="h-5 w-5" />
              </div>
              <TrendingUp className="h-4 w-4 text-white/70" />
            </div>
            <p className="text-xs font-medium text-emerald-50 uppercase tracking-wider">Total Pago</p>
            <p className="text-[28px] font-bold tracking-tight leading-none mt-1">{formatCurrency(data.stats.totalPaid)}</p>
            <p className="text-xs text-emerald-50 mt-1.5">Acumulado histórico</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-2xl" />
          <CardContent className="relative p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs font-medium text-amber-50 uppercase tracking-wider">Pendências</p>
            <p className="text-[28px] font-bold tracking-tight leading-none mt-1">{data.stats.pendingPayments}</p>
            <p className="text-xs text-amber-50 mt-1.5">Pagamentos a regularizar</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-2xl" />
          <CardContent className="relative p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs font-medium text-blue-50 uppercase tracking-wider">Próxima Cobrança</p>
            <p className="text-[28px] font-bold tracking-tight leading-none mt-1">{formatCurrency(60000)}</p>
            <p className="text-xs text-blue-50 mt-1.5">Em 305 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {paymentMethodsData.length > 0 && <PaymentMethodsChart data={paymentMethodsData} />}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-[15px] font-semibold">Próximas Cobranças</CardTitle>
            <CardDescription className="text-xs">Renovações automáticas agendadas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.licenses.filter(l => l.autoRenew && l.status === 'active').map((lic) => (
              <div key={lic.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                  <RefreshCw className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{lic.applicationName || 'Licença'}</p>
                  <p className="text-xs text-slate-500">Renovação em {lic.endDate ? formatDate(lic.endDate) : 'N/A'}</p>
                </div>
                <p className="text-sm font-semibold text-slate-900">{formatCurrency(lic.price)}</p>
              </div>
            ))}
            {data.licenses.filter(l => l.autoRenew && l.status === 'active').length === 0 && (
              <EmptyState icon={RefreshCw} title="Nenhuma cobrança agendada" description="Renovações aparecerão aqui" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[15px] font-semibold">Histórico de Pagamentos</CardTitle>
              <CardDescription className="text-xs">Transações processadas via Stripe</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              Filtrar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="hidden md:grid grid-cols-12 gap-4 px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            <div className="col-span-5">Descrição</div>
            <div className="col-span-2">Método</div>
            <div className="col-span-2">Data</div>
            <div className="col-span-2 text-right">Valor</div>
            <div className="col-span-1 text-right">Status</div>
          </div>
          <div className="space-y-1">
            {data.payments.map((pay) => (
              <div key={pay.id} className="grid grid-cols-12 gap-4 items-center px-3 py-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="col-span-12 md:col-span-5 flex items-center gap-3">
                  <PaymentStatusIcon status={pay.status} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{pay.description}</p>
                    {pay.invoiceUrl && (
                      <a href={pay.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-600 hover:underline flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Ver nota fiscal
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                </div>
                <div className="col-span-4 md:col-span-2">
                  <Badge variant="outline" className="text-xs capitalize">
                    {pay.method === 'card' ? 'Cartão' : pay.method === 'pix' ? 'PIX' : 'Boleto'}
                  </Badge>
                </div>
                <div className="col-span-4 md:col-span-2 text-xs text-slate-500">{formatDate(pay.createdAt)}</div>
                <div className="col-span-2 md:col-span-2 text-right">
                  <p className="text-sm font-semibold text-slate-900">{formatCurrency(pay.amount)}</p>
                </div>
                <div className="col-span-2 md:col-span-1 flex justify-end">
                  <Badge variant="outline" className={`text-[10px] ${
                    pay.status === 'succeeded' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    pay.status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' :
                    pay.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {pay.status === 'succeeded' ? 'Pago' : pay.status === 'failed' ? 'Falhou' : pay.status === 'pending' ? 'Pendente' : pay.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// =====================================================
// VIEW: SUPPORT
// =====================================================

function SupportView({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Suporte</h1>
          <p className="text-sm text-slate-500 mt-1">Chamados, mensagens e central de ajuda</p>
        </div>
        <Button size="sm" className="h-8">
          <Plus className="h-4 w-4 mr-1.5" />
          Abrir Chamado
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MiniStat icon={Clock} label="Abertos" value={data.tickets.filter(t => t.status === 'open').length} color="text-blue-600 bg-blue-50" />
        <MiniStat icon={Activity} label="Em Andamento" value={data.tickets.filter(t => t.status === 'in_progress').length} color="text-amber-600 bg-amber-50" />
        <MiniStat icon={CheckCircle2} label="Resolvidos" value={data.tickets.filter(t => t.status === 'resolved').length} color="text-emerald-600 bg-emerald-50" />
        <MiniStat icon={AlertTriangle} label="Urgentes" value={data.tickets.filter(t => t.priority === 'urgent').length} color="text-red-600 bg-red-50" />
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-[15px] font-semibold">Chamados de Suporte</CardTitle>
          <CardDescription className="text-xs">Histórico completo de atendimentos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.tickets.map((ticket) => (
            <div key={ticket.id} className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 ${
                ticket.priority === 'urgent' ? 'bg-red-50' :
                ticket.priority === 'high' ? 'bg-amber-50' :
                'bg-blue-50'
              }`}>
                <LifeBuoy className={`h-5 w-5 ${
                  ticket.priority === 'urgent' ? 'text-red-600' :
                  ticket.priority === 'high' ? 'text-amber-600' :
                  'text-blue-600'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-sm font-medium text-slate-900">{ticket.subject}</h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <PriorityBadge priority={ticket.priority} />
                    <TicketStatusBadge status={ticket.status} />
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="capitalize">{ticket.category}</span>
                  <span>•</span>
                  <span>Aberto em {formatDate(ticket.createdAt)}</span>
                  {ticket.resolvedAt && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-600">Resolvido em {formatDate(ticket.resolvedAt)}</span>
                    </>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// =====================================================
// VIEW: ADMIN
// =====================================================

function AdminView({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Central de Comando</h1>
        <p className="text-sm text-slate-500 mt-1">Painel administrativo da plataforma Orion</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard icon={Users} label="Clientes Ativos" value="5" sub="2 suspensos" color="bg-blue-500" />
        <AdminStatCard icon={AppWindow} label="Aplicações" value="6" sub="3 publicadas" color="bg-purple-500" />
        <AdminStatCard icon={DollarSign} label="MRR" value={formatCurrency(96000)} sub="Receita recorrente" color="bg-emerald-500" />
        <AdminStatCard icon={Server} label="Serviços" value="12" sub="11 operacionais" color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
              <Server className="h-4 w-4 text-slate-500" />
              Monitoramento de Serviços
            </CardTitle>
            <CardDescription className="text-xs">Status em tempo real da infraestrutura</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <AdminServiceRow icon={Server} name="API Gateway" status="operational" uptime="99.9%" latency="45ms" />
            <AdminServiceRow icon={Cpu} name="Build Service" status="operational" uptime="100%" latency="12ms" />
            <AdminServiceRow icon={HardDrive} name="Object Storage" status="operational" uptime="99.95%" latency="28ms" />
            <AdminServiceRow icon={Shield} name="License Service" status="degraded" uptime="98.2%" latency="120ms" />
            <AdminServiceRow icon={Zap} name="AI Gateway" status="operational" uptime="99.8%" latency="350ms" />
            <AdminServiceRow icon={CreditCard} name="Stripe Webhook" status="operational" uptime="99.99%" latency="85ms" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-slate-500" />
              Atividade Recente
            </CardTitle>
            <CardDescription className="text-xs">Eventos do sistema nas últimas 24h</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <ActivityItem icon={Rocket} color="bg-emerald-500" title="Aplicação publicada" description="Farmácia Gestão Pro v2.3.1" time="há 2 horas" />
              <ActivityItem icon={CreditCard} color="bg-blue-500" title="Pagamento confirmado" description="R$ 18.000,00 via PIX" time="há 5 horas" />
              <ActivityItem icon={Download} color="bg-purple-500" title="Novo download" description="Super Express PDV v3.1.0" time="há 8 horas" />
              <ActivityItem icon={AlertTriangle} color="bg-amber-500" title="Licença suspensa" description="Clínica Vida - inadimplência" time="há 1 dia" />
              <ActivityItem icon={Users} color="bg-blue-500" title="Novo cliente" description="Construtora Top registrou-se" time="há 2 dias" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* IA Usage */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4 text-slate-500" />
            Consumo de IA
          </CardTitle>
          <CardDescription className="text-xs">Monitoramento de uso e custos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="p-4 rounded-xl bg-slate-50">
              <p className="text-xs text-slate-500 mb-1">Tokens Consumidos</p>
              <p className="text-xl font-bold text-slate-900">1.2M</p>
              <p className="text-[10px] text-emerald-600 mt-1">↓ 12% vs semana anterior</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50">
              <p className="text-xs text-slate-500 mb-1">Custo (USD)</p>
              <p className="text-xl font-bold text-slate-900">$48.50</p>
              <p className="text-[10px] text-emerald-600 mt-1">↓ 8% vs semana anterior</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50">
              <p className="text-xs text-slate-500 mb-1">Queries</p>
              <p className="text-xl font-bold text-slate-900">3,847</p>
              <p className="text-[10px] text-blue-600 mt-1">↑ 5% vs semana anterior</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">OpenAI GPT-4o</span>
              <span className="font-medium text-slate-900">68% (816K tokens)</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: '68%' }} />
            </div>
            <div className="flex items-center justify-between text-xs mt-2">
              <span className="text-slate-500">Anthropic Claude</span>
              <span className="font-medium text-slate-900">32% (384K tokens)</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: '32%' }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Integration Status - Conforme Doc 29, Seção 19 */}
      <ModuleIntegrationStatus />

      {/* Security Panel - Conforme Doc 29, Seção 14 */}
      <SecurityPanel mfaEnabled={data.customer.mfaEnabled} />

      {/* Audit Logs - Conforme Doc 29, Seção 14 */}
      <AuditLogViewer logs={data.auditLogs.map(log => ({ action: log.action, entity: log.entity, ipAddress: log.ipAddress, createdAt: log.createdAt }))} />
    </div>
  )
}

// =====================================================
// HELPERS
// =====================================================

function AdminStatCard({ icon: Icon, label, value, sub, color }: { icon: typeof Users; label: string; value: string; sub: string; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${color} text-white`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-slate-900 mt-0.5">{value}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  )
}

function AdminServiceRow({ icon: Icon, name, status, uptime, latency }: { icon: typeof Server; name: string; status: string; uptime: string; latency: string }) {
  const statusColor = status === 'operational' ? 'bg-emerald-500' : status === 'degraded' ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
        <Icon className="h-4 w-4 text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-700">{name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <div className={`h-1.5 w-1.5 rounded-full ${statusColor} ${status === 'operational' ? 'animate-pulse' : ''}`} />
          <span className="text-[10px] text-slate-500">Uptime: {uptime} • Latência: {latency}</span>
        </div>
      </div>
      <Badge variant="outline" className={`text-[10px] ${
        status === 'operational' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
        status === 'degraded' ? 'bg-amber-50 text-amber-700 border-amber-200' :
        'bg-red-50 text-red-700 border-red-200'
      }`}>
        {status === 'operational' ? 'OK' : status === 'degraded' ? 'Degradado' : 'Down'}
      </Badge>
    </div>
  )
}

function ActivityItem({ icon: Icon, color, title, description, time }: { icon: typeof Rocket; color: string; title: string; description: string; time: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`flex h-7 w-7 items-center justify-center rounded-full ${color} text-white flex-shrink-0`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-900">{title}</p>
        <p className="text-[11px] text-slate-500 truncate">{description}</p>
      </div>
      <span className="text-[10px] text-slate-400 flex-shrink-0">{time}</span>
    </div>
  )
}

function MiniStat({ icon: Icon, label, value, color }: { icon: typeof Clock; label: string; value: number; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-xl font-bold text-slate-900">{value}</p>
      </CardContent>
    </Card>
  )
}

function EmptyState({ icon: Icon, title, description }: { icon: typeof Download; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-3">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      <p className="text-xs text-slate-500 mt-1">{description}</p>
    </div>
  )
}

// =====================================================
// FORMATTERS
// =====================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date))
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}
