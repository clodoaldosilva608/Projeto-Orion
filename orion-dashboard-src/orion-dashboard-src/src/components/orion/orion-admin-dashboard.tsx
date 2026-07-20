'use client'

/**
 * Orion Platform — Central de Comando (Admin)
 * Conforme Documento 29, Seção 9
 * 
 * 6 áreas de gestão completa:
 * 1. Clientes - CRUD completo, permissões, bloqueios
 * 2. Aplicações - criação, atualização, publicação, remoção, rollback
 * 3. Licenças - ativação, renovação, cancelamento, suspensão
 * 4. Financeiro - Stripe, pagamentos, reembolsos, assinaturas
 * 5. IA - monitoramento, consumo, provedores, custos
 * 6. Monitoramento - logs, métricas, auditoria, observabilidade
 */
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, AppWindow, Key, CreditCard, Cpu, Activity,
  Bell, Menu, X, Zap, Shield, ChevronRight, ChevronDown, Search,
  Settings, DollarSign, Server, HardDrive, AlertTriangle, ArrowUpRight,
  ArrowDownRight, Plus, Filter, Download, RefreshCw, MoreVertical,
  Eye, Edit, Trash2, Ban, CheckCircle2, XCircle, Clock, Rocket,
  RotateCcw, FileText, ExternalLink, TrendingUp, Building2, Lock,
  AlertCircle, Power, UserPlus, UserX, Crown, Star, Upload, GitBranch,
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
  Sparkline, ProgressRing,
} from './orion-charts'
import { useMutations, useConfirm, ConfirmDialog } from './orion-hooks'
import {
  AppLifecycleVisualizer, LicenseLifecycleVisualizer, DevelopmentTracker,
  SecurityPanel, ModuleIntegrationStatus, DistributionDetails, AuditLogViewer,
  CustomerJourneyTracker, NewProjectForm, TrialBanner,
} from './orion-features'
import { CreateCustomerModal, CreateApplicationModal, CreateLicenseModal, FlowVisualizer } from './orion-modals'
import { NotificationsPanel, RoadmapVisualizer, VersionHistory, BusinessRulesValidator, exportToCSV } from "./orion-extras"
import type { AdminDashboardData } from '@/lib/admin-data'

type ViewType = 'overview' | 'customers' | 'applications' | 'licenses' | 'financial' | 'ai' | 'monitoring'

// =====================================================
// MAIN ADMIN SHELL
// =====================================================

export function OrionAdminDashboardInner({ data }: { data: AdminDashboardData }) {
  const [activeView, setActiveView] = useState<ViewType>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateCustomer, setShowCreateCustomer] = useState(false)
  const [showCreateApp, setShowCreateApp] = useState(false)
  const [showCreateLicense, setShowCreateLicense] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const mutations = useMutations()
  const { confirmState, confirm, close: closeConfirm } = useConfirm()

  // Mock notifications for the panel — calculadas uma vez (evita impureza no render)
  const adminNotifications = useMemo(() => {
    const now = Date.now()
    return [
      { id: 'n1', title: 'Pagamento confirmado', message: 'R$ 18.000 via PIX — Beatriz Lima', type: 'payment', priority: 'normal', read: false, createdAt: new Date(now - 2 * 60 * 60 * 1000) },
      { id: 'n2', title: 'Licença suspensa', message: 'Rafael Costa — inadimplência', type: 'license', priority: 'urgent', read: false, createdAt: new Date(now - 5 * 60 * 60 * 1000) },
      { id: 'n3', title: 'Nova aplicação publicada', message: 'Farmácia Gestão Pro v2.3.1', type: 'app', priority: 'high', read: false, createdAt: new Date(now - 8 * 60 * 60 * 1000) },
      { id: 'n4', title: 'Chamado urgente aberto', message: 'Clínica Vida — Licença suspensa', type: 'support', priority: 'urgent', read: true, createdAt: new Date(now - 24 * 60 * 60 * 1000) },
    ]
  }, [])

  const menuGroups: Array<{
    id: string
    label: string
    items: Array<{ id: ViewType; label: string; icon: typeof Users; badge?: number }>
  }> = [
    {
      id: 'overview',
      label: 'Plataforma',
      items: [{ id: 'overview', label: 'Visão Geral', icon: LayoutDashboard }],
    },
    {
      id: 'management',
      label: 'Gestão',
      items: [
        { id: 'customers', label: 'Clientes', icon: Users, badge: data.stats.totalCustomers },
        { id: 'applications', label: 'Aplicações', icon: AppWindow, badge: data.stats.totalApplications },
        { id: 'licenses', label: 'Licenças', icon: Key, badge: data.stats.totalLicenses },
      ],
    },
    {
      id: 'operations',
      label: 'Operações',
      items: [
        { id: 'financial', label: 'Financeiro', icon: CreditCard },
        { id: 'ai', label: 'Inteligência Artificial', icon: Cpu },
        { id: 'monitoring', label: 'Monitoramento', icon: Activity, badge: data.stats.openTickets },
      ],
    },
  ]

  const currentViewLabel = menuGroups
    .flatMap(g => g.items)
    .find(item => item.id === activeView)?.label || 'Visão Geral'

  return (
    <div className="min-h-screen bg-[#FAFAFB] flex">
      {/* ============ SIDEBAR ============ */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-0 z-50 w-[260px] h-screen bg-[#0A0A0B] text-white flex flex-col transition-transform duration-300`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-700 shadow-lg shadow-red-500/20">
              <Crown className="h-4 w-4 text-white" />
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#0A0A0B]" />
            </div>
            <div>
              <p className="text-[15px] font-bold tracking-tight leading-none">Orion</p>
              <p className="text-[10px] text-red-400 leading-none mt-0.5">Admin Control</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden text-white/40 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Admin Profile */}
        <div className="px-3 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <Avatar className="h-9 w-9 border border-red-500/30">
              <AvatarFallback className="bg-gradient-to-br from-red-900 to-slate-900 text-red-300 text-xs font-bold">AD</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">Administrador</p>
              <p className="text-[10px] text-red-400 truncate">Super Admin • MFA Ativo</p>
            </div>
            <Shield className="h-3.5 w-3.5 text-emerald-400" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-1">
          {menuGroups.map(group => (
            <div key={group.id} className="mb-1">
              <p className="px-3 py-1.5 text-[10px] font-semibold text-white/30 uppercase tracking-wider">{group.label}</p>
              <div className="space-y-0.5 mt-0.5">
                {group.items.map(item => {
                  const Icon = item.icon
                  const isActive = activeView === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActiveView(item.id); setSidebarOpen(false) }}
                      className={`group w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all relative ${
                        isActive ? 'bg-white/[0.08] text-white' : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] bg-red-500 rounded-r-full" />}
                      <Icon className={`h-4 w-4 ${isActive ? 'text-red-400' : 'text-white/40 group-hover:text-white/60'}`} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${isActive ? 'bg-red-500 text-white' : 'bg-white/[0.06] text-white/40'}`}>{item.badge}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* System Status */}
        <div className="px-3 py-3 border-t border-white/[0.06]">
          <div className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <div className="absolute inset-0 h-2 w-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
              </div>
              <span className="text-[10px] text-white/40">Plataforma Operacional</span>
            </div>
            <span className="text-[10px] text-white/30 font-mono">99.9%</span>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ============ MAIN ============ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-30 flex items-center px-4 lg:px-6 gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-4 w-4" />
          </Button>
          <div className="hidden md:flex items-center gap-2 text-[13px]">
            <span className="text-slate-400">Admin</span>
            <ChevronRight className="h-3 w-3 text-slate-300" />
            <span className="font-medium text-slate-900">{currentViewLabel}</span>
          </div>
          <div className="ml-auto hidden md:flex items-center relative w-64">
            <Search className="absolute left-3 h-4 w-4 text-slate-400" />
            <Input placeholder="Buscar clientes, apps, licenças..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-9 bg-slate-50 border-slate-200 text-sm" />
          </div>
          <div className="ml-auto md:ml-0 flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-8 w-8" onClick={() => setShowNotifications(true)}>
                    <Bell className="h-4 w-4 text-slate-500" />
                    {data.stats.openTickets > 0 && <span className="absolute top-0.5 right-0.5 h-3.5 w-3.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold">{data.stats.openTickets}</span>}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Alertas</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="ghost" size="icon" className="h-8 w-8"><Settings className="h-4 w-4 text-slate-500" /></Button>
            <Separator orientation="vertical" className="h-5 mx-1" />
            <Avatar className="h-7 w-7 ring-1 ring-red-200"><AvatarFallback className="bg-red-600 text-white text-[11px] font-bold">AD</AvatarFallback></Avatar>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={activeView} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
              {activeView === 'overview' && <AdminOverview data={data} />}
              {activeView === 'customers' && <CustomersView data={data} searchQuery={searchQuery} onNewCustomer={() => setShowCreateCustomer(true)} />}
              {activeView === 'applications' && <ApplicationsView data={data} searchQuery={searchQuery} onNewApp={() => setShowCreateApp(true)} />}
              {activeView === 'licenses' && <LicensesView data={data} searchQuery={searchQuery} onNewLicense={() => setShowCreateLicense(true)} />}
              {activeView === 'financial' && <FinancialView data={data} searchQuery={searchQuery} />}
              {activeView === 'ai' && <AIView data={data} />}
              {activeView === 'monitoring' && <MonitoringView data={data} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog state={confirmState} onClose={closeConfirm} />

      {/* Create Modals */}
      <CreateCustomerModal
        open={showCreateCustomer}
        onClose={() => setShowCreateCustomer(false)}
        onSubmit={(d) => { mutations.createCustomer(d); setShowCreateCustomer(false); setTimeout(() => window.location.reload(), 1500) }}
      />
      <CreateApplicationModal
        open={showCreateApp}
        onClose={() => setShowCreateApp(false)}
        customers={data.customers.map(c => ({ id: c.id, name: c.name, company: c.company }))}
        onSubmit={(d) => { mutations.createApplication(d); setShowCreateApp(false); setTimeout(() => window.location.reload(), 1500) }}
      />
      <CreateLicenseModal
        open={showCreateLicense}
        onClose={() => setShowCreateLicense(false)}
        customers={data.customers.map(c => ({ id: c.id, name: c.name }))}
        onSubmit={(d) => { mutations.createLicense(d); setShowCreateLicense(false); setTimeout(() => window.location.reload(), 1500) }}
      />

      {/* Notifications Panel */}
      <NotificationsPanel
        open={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={adminNotifications}
        onMarkAllRead={() => { mutations.markAllNotificationsRead(); setShowNotifications(false) }}
        onMarkRead={(id) => mutations.markNotificationRead(id)}
      />
    </div>
  )
}

// =====================================================
// VIEW: OVERVIEW (Dashboard principal do admin)
// =====================================================

function AdminOverview({ data }: { data: AdminDashboardData }) {
  const revenueData = [42, 55, 48, 72, 78, 96, data.stats.totalRevenue / 1000]
  const customerGrowth = [2, 3, 3, 4, 5, 5, data.stats.totalCustomers]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Visão Geral da Plataforma</h1>
        <p className="text-sm text-slate-500 mt-1">Painel de controle administrativo do Orion SaaS Platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminKpiCard icon={Users} label="Clientes" value={data.stats.totalCustomers.toString()} sub={`${data.stats.activeCustomers} ativos • ${data.stats.suspendedCustomers} suspensos`} trend={12} sparklineData={customerGrowth} color="blue" />
        <AdminKpiCard icon={AppWindow} label="Aplicações" value={data.stats.totalApplications.toString()} sub={`${data.stats.publishedApplications} publicadas`} trend={8} sparklineData={[1, 2, 3, 4, 5, 5, 6]} color="purple" />
        <AdminKpiCard icon={DollarSign} label="Receita Total" value={formatCurrency(data.stats.totalRevenue)} sub={`MRR: ${formatCurrency(data.stats.monthlyRecurringRevenue)}`} trend={18} sparklineData={revenueData} color="emerald" />
        <AdminKpiCard icon={AlertTriangle} label="Pendências" value={(data.stats.pendingPayments + data.stats.failedPayments + data.stats.openTickets).toString()} sub={`${data.stats.pendingPayments} pagamentos • ${data.stats.openTickets} tickets`} trend={-5} sparklineData={[5, 4, 6, 3, 4, 2, 3]} color="amber" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-[15px] font-semibold">Receita da Plataforma</CardTitle>
            <CardDescription className="text-xs">Faturamento acumulado mensal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] flex items-end gap-2">
              {revenueData.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-slate-100 rounded-t-lg overflow-hidden flex items-end" style={{ height: '200px' }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(val / Math.max(...revenueData)) * 100}%` }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      className="w-full bg-gradient-to-t from-slate-800 to-slate-600 rounded-t-lg"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">{['Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago'][i]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-[15px] font-semibold">Distribuição de Licenças</CardTitle>
            <CardDescription className="text-xs">Por status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <LicenseDistRow label="Ativas" count={data.stats.activeLicenses} total={data.stats.totalLicenses} color="bg-emerald-500" />
            <LicenseDistRow label="Trial" count={data.stats.trialLicenses} total={data.stats.totalLicenses} color="bg-amber-500" />
            <LicenseDistRow label="Suspensas" count={data.stats.totalLicenses - data.stats.activeLicenses - data.stats.trialLicenses} total={data.stats.totalLicenses} color="bg-red-500" />
            <Separator />
            <div className="flex items-center justify-between pt-2">
              <ProgressRing value={(data.stats.activeLicenses / Math.max(data.stats.totalLicenses, 1)) * 100} size={60} color="#10B981" label="Ativas" />
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">{data.stats.totalLicenses}</p>
                <p className="text-xs text-slate-500">Total de Licenças</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity + System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-[15px] font-semibold">Clientes Recentes</CardTitle>
            <CardDescription className="text-xs">Últimos cadastros na plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.customers.slice(0, 5).map(c => (
              <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                <Avatar className="h-9 w-9"><AvatarFallback className="bg-slate-200 text-slate-700 text-xs font-medium">{c.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{c.name}</p>
                  <p className="text-xs text-slate-500 truncate">{c.company} • {c.niche}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] ${c.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {c.status === 'active' ? 'Ativo' : 'Suspenso'}
                  </Badge>
                  <span className="text-[10px] text-slate-400">{c.appCount} apps</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-slate-500" />
              Saúde da Plataforma
            </CardTitle>
            <CardDescription className="text-xs">Status dos serviços</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <SystemHealthRow icon={Server} label="API Gateway" status="operational" value="99.9% • 45ms" />
            <SystemHealthRow icon={Cpu} label="Build Service" status="operational" value="100% • 12ms" />
            <SystemHealthRow icon={HardDrive} label="Object Storage" status="operational" value="99.95% • 28ms" />
            <SystemHealthRow icon={Shield} label="License Service" status="degraded" value="98.2% • 120ms" />
            <SystemHealthRow icon={Zap} label="AI Gateway" status="operational" value="99.8% • 350ms" />
            <SystemHealthRow icon={CreditCard} label="Stripe Webhook" status="operational" value="99.99% • 85ms" />
          </CardContent>
        </Card>
      </div>
      {/* Customer Journey Tracker - Doc 29, Seção 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <CustomerJourneyTracker currentStep={4} />
        <NewProjectForm />
      </div>
    </div>
  )
}

// =====================================================
// VIEW: CUSTOMERS (CRUD completo)
// =====================================================

function CustomersView({ data, searchQuery, onNewCustomer }: { data: AdminDashboardData; searchQuery: string; onNewCustomer: () => void }) {
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showCreateModal, setShowCreateModal] = useState(false)
  const mutations = useMutations()
  const { confirm } = useConfirm()

  const handleToggleStatus = (customer: { id: string; name: string; status: string }) => {
    const newStatus = customer.status === 'active' ? 'suspended' : 'active'
    confirm(
      newStatus === 'active' ? 'Ativar Cliente' : 'Suspender Cliente',
      `Deseja realmente ${newStatus === 'active' ? 'ativar' : 'suspender'} o cliente "${customer.name}"?`,
      () => mutations.toggleCustomerStatus(customer.id, newStatus).then(() => setTimeout(() => window.location.reload(), 1000)),
      newStatus === 'active' ? 'info' : 'warning'
    )
  }

  const handleDelete = (customer: { id: string; name: string }) => {
    confirm(
      'Excluir Cliente',
      `Esta ação não pode ser desfeita. O cliente "${customer.name}" e todos os seus dados serão removidos.`,
      () => mutations.deleteCustomer(customer.id).then(() => setTimeout(() => window.location.reload(), 1000)),
      'danger'
    )
  }

  const handleBulkAction = (action: 'activate' | 'suspend' | 'delete') => {
    const count = selected.size
    const actionLabel = action === 'activate' ? 'ativar' : action === 'suspend' ? 'suspender' : 'excluir'
    confirm(
      `${actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)} ${count} Cliente(s)`,
      `Deseja realmente ${actionLabel} ${count} cliente(s) selecionado(s)?`,
      async () => {
        for (const id of selected) {
          if (action === 'delete') await mutations.deleteCustomer(id)
          else await mutations.toggleCustomerStatus(id, action === 'activate' ? 'active' : 'suspended')
        }
        setSelected(new Set())
        setTimeout(() => window.location.reload(), 1500)
      },
      action === 'delete' ? 'danger' : 'warning'
    )
  }

  const filtered = useMemo(() => {
    let result = data.customers
    if (filter !== 'all') result = result.filter(c => c.status === filter)
    if (searchQuery) result = result.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase()))
    return result
  }, [data.customers, filter, searchQuery])

  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map(c => c.id)))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Gestão de Clientes</h1>
          <p className="text-sm text-slate-500 mt-1">CRUD completo • Permissões • Bloqueios</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => exportToCSV(filtered, "clientes")}><Download className="h-3.5 w-3.5 mr-1.5" />Exportar</Button>
          <Button size="sm" className="h-8" onClick={onNewCustomer}><UserPlus className="h-4 w-4 mr-1.5" />Novo Cliente</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MiniStatCard icon={Users} label="Total" value={data.stats.totalCustomers} color="bg-blue-500" />
        <MiniStatCard icon={CheckCircle2} label="Ativos" value={data.stats.activeCustomers} color="bg-emerald-500" />
        <MiniStatCard icon={Ban} label="Suspensos" value={data.stats.suspendedCustomers} color="bg-red-500" />
        <MiniStatCard icon={Shield} label="Com MFA" value={data.customers.filter(c => c.mfaEnabled).length} color="bg-purple-500" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <FilterTab label="Todos" count={data.stats.totalCustomers} active={filter === 'all'} onClick={() => setFilter('all')} />
        <FilterTab label="Ativos" count={data.stats.activeCustomers} active={filter === 'active'} onClick={() => setFilter('active')} />
        <FilterTab label="Suspensos" count={data.stats.suspendedCustomers} active={filter === 'suspended'} onClick={() => setFilter('suspended')} />
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 text-white">
          <span className="text-sm font-medium">{selected.size} selecionado(s)</span>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 h-7 text-xs" onClick={() => handleBulkAction('activate')}><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Ativar</Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 h-7 text-xs" onClick={() => handleBulkAction('suspend')}><Ban className="h-3.5 w-3.5 mr-1" />Suspender</Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 h-7 text-xs" onClick={() => handleBulkAction('delete')}><Trash2 className="h-3.5 w-3.5 mr-1" />Excluir</Button>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left p-3 w-10">
                    <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="rounded border-slate-300" />
                  </th>
                  <th className="text-left p-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Cliente</th>
                  <th className="text-left p-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Nicho</th>
                  <th className="text-left p-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Apps</th>
                  <th className="text-left p-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Licenças</th>
                  <th className="text-right p-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Total Pago</th>
                  <th className="text-center p-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-right p-3 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-3">
                      <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} className="rounded border-slate-300" />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9"><AvatarFallback className="bg-slate-200 text-slate-700 text-xs font-medium">{c.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-slate-900 truncate">{c.name}</p>
                            {c.mfaEnabled && <Shield className="h-3 w-3 text-emerald-500" />}
                          </div>
                          <p className="text-xs text-slate-500 truncate">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <Badge variant="outline" className="text-xs">{c.niche || '—'}</Badge>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <span className="text-sm text-slate-600">{c.appCount}</span>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <span className="text-sm text-slate-600">{c.licenseCount}</span>
                    </td>
                    <td className="p-3 text-right hidden sm:table-cell">
                      <span className="text-sm font-medium text-slate-900">{formatCurrency(c.totalPaid)}</span>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="outline" className={`text-[10px] ${c.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {c.status === 'active' ? 'Ativo' : 'Suspenso'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-0.5">
                        <TooltipProvider>
                          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5 text-slate-400" /></Button></TooltipTrigger><TooltipContent>Ver detalhes</TooltipContent></Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="h-3.5 w-3.5 text-slate-400" /></Button></TooltipTrigger><TooltipContent>Editar</TooltipContent></Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleToggleStatus(c)}>{c.status === 'active' ? <Ban className="h-3.5 w-3.5 text-red-400" /> : <Power className="h-3.5 w-3.5 text-emerald-400" />}</Button></TooltipTrigger><TooltipContent>{c.status === 'active' ? 'Suspender' : 'Ativar'}</TooltipContent></Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(c)}><Trash2 className="h-3.5 w-3.5 text-red-400" /></Button></TooltipTrigger><TooltipContent>Excluir</TooltipContent></Tooltip>
                        </TooltipProvider>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// =====================================================
// VIEW: APPLICATIONS (CRUD completo)
// =====================================================

function ApplicationsView({ data, searchQuery, onNewApp }: { data: AdminDashboardData; searchQuery: string; onNewApp: () => void }) {
  const [filter, setFilter] = useState('all')
  const mutations = useMutations()
  const { confirm } = useConfirm()

  const filtered = useMemo(() => {
    let result = data.applications
    if (filter !== 'all') result = result.filter(a => a.status === filter)
    if (searchQuery) result = result.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
    return result
  }, [data.applications, filter, searchQuery])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Gestão de Aplicações</h1>
          <p className="text-sm text-slate-500 mt-1">Criar • Atualizar • Publicar • Remover • Rollback</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => mutations.addToast("warning", "Selecione uma aplicação para rollback")}><RotateCcw className="h-3.5 w-3.5 mr-1.5" />Rollback</Button>
          <Button size="sm" className="h-8" onClick={onNewApp}><Plus className="h-4 w-4 mr-1.5" />Nova Aplicação</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MiniStatCard icon={AppWindow} label="Total" value={data.stats.totalApplications} color="bg-blue-500" />
        <MiniStatCard icon={Rocket} label="Publicadas" value={data.stats.publishedApplications} color="bg-emerald-500" />
        <MiniStatCard icon={GitBranch} label="Em Dev" value={data.applications.filter(a => a.status === 'development').length} color="bg-amber-500" />
        <MiniStatCard icon={Clock} label="Homologação" value={data.applications.filter(a => a.status === 'homologation').length} color="bg-purple-500" />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <FilterTab label="Todas" count={data.stats.totalApplications} active={filter === 'all'} onClick={() => setFilter('all')} />
        <FilterTab label="Publicadas" count={data.stats.publishedApplications} active={filter === 'published'} onClick={() => setFilter('published')} />
        <FilterTab label="Em Desenvolvimento" count={data.applications.filter(a => a.status === 'development').length} active={filter === 'development'} onClick={() => setFilter('development')} />
        <FilterTab label="Em Testes" count={data.applications.filter(a => a.status === 'testing').length} active={filter === 'testing'} onClick={() => setFilter('testing')} />
        <FilterTab label="Homologação" count={data.applications.filter(a => a.status === 'homologation').length} active={filter === 'homologation'} onClick={() => setFilter('homologation')} />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left p-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Aplicação</th>
                  <th className="text-left p-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Cliente</th>
                  <th className="text-left p-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Versão</th>
                  <th className="text-left p-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Complexidade</th>
                  <th className="text-center p-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-right p-3 w-32"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(app => (
                  <tr key={app.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 text-white"><AppWindow className="h-4 w-4" /></div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{app.name}</p>
                          <p className="text-xs text-slate-500 truncate">{app.niche}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <p className="text-sm text-slate-700">{app.customerName}</p>
                      <p className="text-xs text-slate-400">{app.customerCompany}</p>
                    </td>
                    <td className="p-3 hidden lg:table-cell"><Badge variant="outline" className="text-xs font-mono">v{app.version}</Badge></td>
                    <td className="p-3 hidden lg:table-cell"><span className="text-xs text-slate-600 capitalize">{app.complexity}</span></td>
                    <td className="p-3 text-center">
                      <Badge variant="outline" className={`text-[10px] ${
                        app.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        app.status === 'development' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        app.status === 'testing' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        app.status === 'homologation' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {app.status === 'published' ? 'Publicada' : app.status === 'development' ? 'Em Dev' : app.status === 'testing' ? 'Testes' : app.status === 'homologation' ? 'Homolog' : app.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-0.5">
                        <TooltipProvider>
                          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5 text-slate-400" /></Button></TooltipTrigger><TooltipContent>Ver</TooltipContent></Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="h-3.5 w-3.5 text-slate-400" /></Button></TooltipTrigger><TooltipContent>Editar</TooltipContent></Tooltip>
                        </TooltipProvider>
                        {app.status === 'published' && (
                          <TooltipProvider>
                            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { confirm("Rollback de Aplicação", `Deseja fazer rollback de ${app.name} para a versão anterior?`, () => mutations.rollbackApplication(app.id).then(() => setTimeout(() => window.location.reload(), 1000)), "warning") }}><RotateCcw className="h-3.5 w-3.5 text-amber-400" /></Button></TooltipTrigger><TooltipContent>Rollback</TooltipContent></Tooltip>
                          </TooltipProvider>
                        )}
                        <TooltipProvider>
                          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><Trash2 className="h-3.5 w-3.5 text-red-400" /></Button></TooltipTrigger><TooltipContent>Remover</TooltipContent></Tooltip>
                        </TooltipProvider>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* App Lifecycle Visualizer - Doc 29, Seção 5 */}
      {filtered.length > 0 && (
        <AppLifecycleVisualizer currentStatus={filtered[0].status} />
      )}

      {/* Development Process Tracker - Doc 29, Seção 7 */}
      {filtered.length > 0 && (
        <DevelopmentTracker currentStep={filtered[0].status === 'published' ? 9 : filtered[0].status === 'development' ? 4 : filtered[0].status === 'testing' ? 5 : filtered[0].status === 'homologation' ? 6 : 3} complexity={filtered[0].complexity} />
      )}

      {/* Fluxo Técnico - Doc 29, Seção 17 */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-[15px] font-semibold">Fluxo Técnico Oficial</CardTitle>
          <CardDescription className="text-xs">Do cadastro à entrega — 11 etapas</CardDescription>
        </CardHeader>
        <CardContent>
          <FlowVisualizer type="technical" />
        </CardContent>
      </Card>
    </div>
  )
}

// =====================================================
// VIEW: LICENSES (CRUD completo)
// =====================================================

function LicensesView({ data, searchQuery, onNewLicense }: { data: AdminDashboardData; searchQuery: string; onNewLicense: () => void }) {
  const [filter, setFilter] = useState('all')
  const mutations = useMutations()
  const { confirm } = useConfirm()

  const handleSuspend = (lic: { id: string; licenseKey: string }) => {
    confirm('Suspender Licença', `Deseja suspender a licença ${lic.licenseKey.substring(0, 20)}...?`, () => mutations.suspendLicense(lic.id).then(() => setTimeout(() => window.location.reload(), 1000)), 'warning')
  }
  const handleActivate = (lic: { id: string; licenseKey: string }) => {
    confirm('Reativar Licença', `Deseja reativar a licença ${lic.licenseKey.substring(0, 20)}...?`, () => mutations.activateLicense(lic.id).then(() => setTimeout(() => window.location.reload(), 1000)), 'info')
  }
  const handleRenew = (lic: { id: string; licenseKey: string }) => {
    confirm('Renovar Licença', `Deseja renovar a licença ${lic.licenseKey.substring(0, 20)}...?`, () => mutations.renewLicense(lic.id).then(() => setTimeout(() => window.location.reload(), 1000)), 'info')
  }
  const handleCancel = (lic: { id: string; licenseKey: string }) => {
    confirm('Cancelar Licença', `Esta ação é irreversível. Cancelar a licença ${lic.licenseKey.substring(0, 20)}...?`, () => mutations.cancelLicense(lic.id).then(() => setTimeout(() => window.location.reload(), 1000)), 'danger')
  }

  const filtered = useMemo(() => {
    let result = data.licenses
    if (filter !== 'all') result = result.filter(l => l.status === filter)
    if (searchQuery) result = result.filter(l => l.licenseKey.toLowerCase().includes(searchQuery.toLowerCase()) || l.customerName.toLowerCase().includes(searchQuery.toLowerCase()))
    return result
  }, [data.licenses, filter, searchQuery])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Gestão de Licenças</h1>
          <p className="text-sm text-slate-500 mt-1">Ativar • Renovar • Cancelar • Suspender</p>
        </div>
        <Button size="sm" className="h-8" onClick={onNewLicense}><Key className="h-4 w-4 mr-1.5" />Gerar Licença</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MiniStatCard icon={Key} label="Total" value={data.stats.totalLicenses} color="bg-blue-500" />
        <MiniStatCard icon={CheckCircle2} label="Ativas" value={data.stats.activeLicenses} color="bg-emerald-500" />
        <MiniStatCard icon={Clock} label="Trial" value={data.stats.trialLicenses} color="bg-amber-500" />
        <MiniStatCard icon={Ban} label="Suspensas" value={data.licenses.filter(l => l.status === 'suspended').length} color="bg-red-500" />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <FilterTab label="Todas" count={data.stats.totalLicenses} active={filter === 'all'} onClick={() => setFilter('all')} />
        <FilterTab label="Ativas" count={data.stats.activeLicenses} active={filter === 'active'} onClick={() => setFilter('active')} />
        <FilterTab label="Trial" count={data.stats.trialLicenses} active={filter === 'trial'} onClick={() => setFilter('trial')} />
        <FilterTab label="Suspensas" count={data.licenses.filter(l => l.status === 'suspended').length} active={filter === 'suspended'} onClick={() => setFilter('suspended')} />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left p-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Licença</th>
                  <th className="text-left p-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Cliente</th>
                  <th className="text-left p-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Plano</th>
                  <th className="text-left p-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Valor</th>
                  <th className="text-center p-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-right p-3 w-32"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(lic => (
                  <tr key={lic.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-slate-400" />
                        <span className="font-mono text-xs text-slate-700">{lic.licenseKey.substring(0, 24)}...</span>
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <p className="text-sm text-slate-700">{lic.customerName}</p>
                      <p className="text-xs text-slate-400">{lic.applicationName || 'Sem app'}</p>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <Badge variant="outline" className={`text-xs capitalize ${
                        lic.plan === 'enterprise' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        lic.plan === 'professional' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        lic.plan === 'trial' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>{lic.plan}</Badge>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <span className="text-sm font-medium text-slate-900">{lic.price > 0 ? formatCurrency(lic.price) : 'Gratuito'}</span>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="outline" className={`text-[10px] ${
                        lic.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        lic.status === 'suspended' ? 'bg-red-50 text-red-700 border-red-200' :
                        lic.status === 'expired' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {lic.status === 'active' ? 'Ativa' : lic.status === 'suspended' ? 'Suspensa' : lic.status === 'expired' ? 'Expirada' : lic.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-0.5">
                        <TooltipProvider>
                          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5 text-slate-400" /></Button></TooltipTrigger><TooltipContent>Ver</TooltipContent></Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRenew(lic)}><RefreshCw className="h-3.5 w-3.5 text-blue-400" /></Button></TooltipTrigger><TooltipContent>Renovar</TooltipContent></Tooltip>
                        </TooltipProvider>
                        {lic.status === 'active' ? (
                          <TooltipProvider>
                            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleSuspend(lic)}><Ban className="h-3.5 w-3.5 text-red-400" /></Button></TooltipTrigger><TooltipContent>Suspender</TooltipContent></Tooltip>
                          </TooltipProvider>
                        ) : lic.status === 'suspended' ? (
                          <TooltipProvider>
                            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleActivate(lic)}><Power className="h-3.5 w-3.5 text-emerald-400" /></Button></TooltipTrigger><TooltipContent>Reativar</TooltipContent></Tooltip>
                          </TooltipProvider>
                        ) : null}
                        <TooltipProvider>
                          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCancel(lic)}><XCircle className="h-3.5 w-3.5 text-red-400" /></Button></TooltipTrigger><TooltipContent>Cancelar</TooltipContent></Tooltip>
                        </TooltipProvider>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* License Lifecycle Visualizer - Doc 29, Seção 6 */}
      {filtered.length > 0 && (
        <LicenseLifecycleVisualizer currentStatus={filtered[0].status} />
      )}
    </div>
  )
}

// =====================================================
// VIEW: FINANCIAL (Stripe completo)
// =====================================================

function FinancialView({ data, searchQuery }: { data: AdminDashboardData; searchQuery: string }) {
  const mutations = useMutations()
  const { confirm } = useConfirm()

  const handleRefund = (pay: { id: string; amount: number; customerName: string }) => {
    confirm('Reembolsar Pagamento', `Deseja reembolsar R$ ${pay.amount.toLocaleString('pt-BR')} de ${pay.customerName}? Esta ação é irreversível.`, () => mutations.refundPayment(pay.id).then(() => setTimeout(() => window.location.reload(), 1000)), 'danger')
  }

  const filtered = useMemo(() => {
    if (!searchQuery) return data.payments
    return data.payments.filter(p => p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [data.payments, searchQuery])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Gestão Financeira</h1>
          <p className="text-sm text-slate-500 mt-1">Stripe • Pagamentos • Reembolsos • Assinaturas</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => exportToCSV(filtered, "pagamentos")}><Download className="h-3.5 w-3.5 mr-1.5" />Exportar</Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => exportToCSV(filtered.filter(p => p.invoiceUrl), "notas_fiscais")}><RotateCcw className="h-3.5 w-3.5 mr-1.5" />Reembolsar</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
          <CardContent className="p-5">
            <DollarSign className="h-5 w-5 mb-2 text-white/70" />
            <p className="text-xs text-emerald-50 uppercase tracking-wider">Receita Total</p>
            <p className="text-2xl font-bold">{formatCurrency(data.stats.totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-5">
            <TrendingUp className="h-5 w-5 mb-2 text-white/70" />
            <p className="text-xs text-blue-50 uppercase tracking-wider">MRR</p>
            <p className="text-2xl font-bold">{formatCurrency(data.stats.monthlyRecurringRevenue)}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
          <CardContent className="p-5">
            <Clock className="h-5 w-5 mb-2 text-white/70" />
            <p className="text-xs text-amber-50 uppercase tracking-wider">Pendentes</p>
            <p className="text-2xl font-bold">{data.stats.pendingPayments}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
          <CardContent className="p-5">
            <XCircle className="h-5 w-5 mb-2 text-white/70" />
            <p className="text-xs text-red-50 uppercase tracking-wider">Falhados</p>
            <p className="text-2xl font-bold">{data.stats.failedPayments}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left p-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Descrição</th>
                  <th className="text-left p-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Cliente</th>
                  <th className="text-left p-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Método</th>
                  <th className="text-right p-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Valor</th>
                  <th className="text-center p-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-right p-3 w-24"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(pay => (
                  <tr key={pay.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {pay.status === 'succeeded' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : pay.status === 'failed' ? <XCircle className="h-4 w-4 text-red-500" /> : <Clock className="h-4 w-4 text-amber-500" />}
                        <div>
                          <p className="text-sm font-medium text-slate-900">{pay.description}</p>
                          {pay.stripePaymentId && <p className="text-[10px] font-mono text-slate-400">{pay.stripePaymentId}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell"><span className="text-sm text-slate-700">{pay.customerName}</span></td>
                    <td className="p-3 hidden lg:table-cell"><Badge variant="outline" className="text-xs">{pay.method === 'card' ? 'Cartão' : pay.method === 'pix' ? 'PIX' : 'Boleto'}</Badge></td>
                    <td className="p-3 text-right"><span className="text-sm font-semibold text-slate-900">{formatCurrency(pay.amount)}</span></td>
                    <td className="p-3 text-center">
                      <Badge variant="outline" className={`text-[10px] ${pay.status === 'succeeded' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : pay.status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {pay.status === 'succeeded' ? 'Pago' : pay.status === 'failed' ? 'Falhou' : 'Pendente'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-0.5">
                        {pay.invoiceUrl && <TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><ExternalLink className="h-3.5 w-3.5 text-slate-400" /></Button></TooltipTrigger><TooltipContent>Nota fiscal</TooltipContent></Tooltip></TooltipProvider>}
                        {pay.status === 'succeeded' && <TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRefund(pay)}><RotateCcw className="h-3.5 w-3.5 text-amber-400" /></Button></TooltipTrigger><TooltipContent>Reembolsar</TooltipContent></Tooltip></TooltipProvider>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// =====================================================
// VIEW: AI (Monitoramento de IA)
// =====================================================

function AIView({ data }: { data: AdminDashboardData }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Inteligência Artificial</h1>
        <p className="text-sm text-slate-500 mt-1">Monitoramento • Consumo • Provedores • Custos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-5">
            <Zap className="h-5 w-5 mb-2 text-white/70" />
            <p className="text-xs text-blue-50 uppercase tracking-wider">Tokens Consumidos</p>
            <p className="text-2xl font-bold">{(data.stats.totalTokensConsumed / 1000000).toFixed(1)}M</p>
            <p className="text-xs text-blue-50 mt-1">↓ 12% vs semana anterior</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
          <CardContent className="p-5">
            <DollarSign className="h-5 w-5 mb-2 text-white/70" />
            <p className="text-xs text-emerald-50 uppercase tracking-wider">Custo (USD)</p>
            <p className="text-2xl font-bold">${data.stats.aiCostUsd}</p>
            <p className="text-xs text-emerald-50 mt-1">↓ 8% vs semana anterior</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-5">
            <Activity className="h-5 w-5 mb-2 text-white/70" />
            <p className="text-xs text-purple-50 uppercase tracking-wider">Queries</p>
            <p className="text-2xl font-bold">{data.stats.totalQueries.toLocaleString()}</p>
            <p className="text-xs text-purple-50 mt-1">↑ 5% vs semana anterior</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-[15px] font-semibold">Provedores de IA</CardTitle>
            <CardDescription className="text-xs">Distribuição de consumo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-700">OpenAI GPT-4o</span>
                <span className="text-slate-500">68% (816K tokens)</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '68%' }} transition={{ duration: 0.5 }} className="h-full bg-blue-500 rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-700">Anthropic Claude</span>
                <span className="text-slate-500">32% (384K tokens)</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '32%' }} transition={{ duration: 0.5 }} className="h-full bg-purple-500 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-[15px] font-semibold">Uso por Modelo</CardTitle>
            <CardDescription className="text-xs">Detalhamento de consumo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <AIModelRow name="GPT-4o" tokens="520K" cost="$22.50" percentage={43} color="bg-blue-500" />
            <AIModelRow name="GPT-4o-mini" tokens="296K" cost="$3.20" percentage={25} color="bg-cyan-500" />
            <AIModelRow name="Claude 3.5 Sonnet" tokens="240K" cost="$15.30" percentage={20} color="bg-purple-500" />
            <AIModelRow name="Claude 3 Haiku" tokens="144K" cost="$7.50" percentage={12} color="bg-violet-500" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// =====================================================
// VIEW: MONITORING (Logs, métricas, auditoria)
// =====================================================

function MonitoringView({ data }: { data: AdminDashboardData }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Monitoramento</h1>
        <p className="text-sm text-slate-500 mt-1">Logs • Métricas • Auditoria • Observabilidade</p>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
            <Server className="h-4 w-4 text-slate-500" />
            Status dos Serviços
          </CardTitle>
          <CardDescription className="text-xs">12 módulos do ecossistema Orion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SystemHealthRow icon={Server} label="API Gateway" status="operational" value="99.9% • 45ms" />
            <SystemHealthRow icon={Cpu} label="Build Service" status="operational" value="100% • 12ms" />
            <SystemHealthRow icon={HardDrive} label="Object Storage" status="operational" value="99.95% • 28ms" />
            <SystemHealthRow icon={Shield} label="License Service" status="degraded" value="98.2% • 120ms" />
            <SystemHealthRow icon={Zap} label="AI Gateway" status="operational" value="99.8% • 350ms" />
            <SystemHealthRow icon={CreditCard} label="Stripe Webhook" status="operational" value="99.99% • 85ms" />
            <SystemHealthRow icon={Lock} label="Identity Service" status="operational" value="99.95% • 32ms" />
            <SystemHealthRow icon={FileText} label="Audit Service" status="operational" value="100% • 8ms" />
            <SystemHealthRow icon={Bell} label="Notification Service" status="operational" value="99.9% • 65ms" />
            <SystemHealthRow icon={Rocket} label="Deployment Service" status="operational" value="99.8% • 110ms" />
            <SystemHealthRow icon={GitBranch} label="Build Pipeline" status="operational" value="99.95% • 220ms" />
            <SystemHealthRow icon={Building2} label="Customer Portal" status="operational" value="99.99% • 25ms" />
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-500" />
                Logs de Auditoria
              </CardTitle>
              <CardDescription className="text-xs">Registro completo de ações administrativas</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => exportToCSV(data.auditLogs, "audit_logs")}><Download className="h-3.5 w-3.5 mr-1.5" />Exportar logs</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {data.auditLogs.map(log => (
              <div key={log.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                <Badge variant="outline" className={`text-[10px] ${
                  log.action === 'login' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  log.action === 'download' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                  log.action === 'publish' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  log.action === 'suspend' ? 'bg-red-50 text-red-700 border-red-200' :
                  'bg-slate-50 text-slate-700 border-slate-200'
                }`}>
                  {log.action}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700">{log.entity}{log.customerName ? ` • ${log.customerName}` : ''}</p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(log.createdAt).toLocaleString('pt-BR')}
                    {log.ipAddress && ` • IP: ${log.ipAddress}`}
                    {log.userAgent && ` • ${log.userAgent.substring(0, 40)}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Panel - Doc 29, Seção 14 */}
      <SecurityPanel mfaEnabled={true} />

      {/* Module Integration Status - Doc 29, Seção 19 */}
      <ModuleIntegrationStatus />

      {/* Fluxo Comercial - Doc 29, Seção 17 */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-[15px] font-semibold">Fluxo Comercial Oficial</CardTitle>
          <CardDescription className="text-xs">Da Landing Page às Atualizações — 10 etapas</CardDescription>
        </CardHeader>
        <CardContent>
          <FlowVisualizer type="commercial" />
        </CardContent>
      </Card>

      {/* Business Rules Validator - Doc 29, Seção 18 */}
      <BusinessRulesValidator />

      {/* Roadmap - Doc 29, Seção 21 */}
      <RoadmapVisualizer />

      {/* Version History - Doc 29, Seção 22 */}
      <VersionHistory />
    </div>
  )
}

// =====================================================
// HELPER COMPONENTS
// =====================================================

function AdminKpiCard({ icon: Icon, label, value, sub, trend, sparklineData, color }: {
  icon: typeof Users; label: string; value: string; sub: string; trend: number; sparklineData: number[]; color: 'blue' | 'emerald' | 'purple' | 'amber'
}) {
  const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', chart: '#3B82F6' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', chart: '#10B981' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', chart: '#8B5CF6' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', chart: '#F59E0B' },
  }
  const c = colorMap[color]
  const isPositive = trend > 0
  return (
    <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-${color}-500/10 to-transparent rounded-full -translate-y-12 translate-x-12 blur-2xl`} />
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.bg}`}><Icon className={`h-5 w-5 ${c.text}`} /></div>
          <div className={`flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-md ${isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
            {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}{Math.abs(trend)}%
          </div>
        </div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-[26px] font-bold text-slate-900 tracking-tight leading-none">{value}</p>
        <p className="text-xs text-slate-500 mt-2">{sub}</p>
        <div className="mt-3 -mx-1"><Sparkline data={sparklineData} color={c.chart} height={32} /></div>
      </CardContent>
    </Card>
  )
}

function MiniStatCard({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: number; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${color} text-white`}><Icon className="h-4 w-4" /></div>
        </div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-slate-900 mt-0.5">{value}</p>
      </CardContent>
    </Card>
  )
}

function FilterTab({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${active ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
      {label}
      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-slate-100'}`}>{count}</span>
    </button>
  )
}

function SystemHealthRow({ icon: Icon, label, status, value }: { icon: typeof Server; label: string; status: string; value: string }) {
  const isOK = status === 'operational'
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100"><Icon className="h-4 w-4 text-slate-500" /></div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-700">{label}</p>
        <p className="text-[10px] text-slate-500">{value}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <div className={`h-2 w-2 rounded-full ${isOK ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
        <span className={`text-[10px] font-medium ${isOK ? 'text-emerald-600' : 'text-amber-600'}`}>{isOK ? 'OK' : 'Degradado'}</span>
      </div>
    </div>
  )
}

function LicenseDistRow({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-900">{count}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function AIModelRow({ name, tokens, cost, percentage, color }: { name: string; tokens: string; cost: string; percentage: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-medium text-slate-700">{name}</span>
          <span className="text-slate-500">{tokens} • {cost}</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${percentage}%` }} />
        </div>
      </div>
    </div>
  )
}

// =====================================================
// FORMATTERS
// =====================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
