'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  AppWindow,
  Key,
  Download,
  CreditCard,
  LifeBuoy,
  Bell,
  Menu,
  X,
  Zap,
  Shield,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  ExternalLink,
  RefreshCw,
  Package,
  Activity,
  HardDrive,
  Sparkles,
  Wrench,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import type { DashboardData } from '@/lib/orion-data'

type ViewType = 'dashboard' | 'applications' | 'updates' | 'licenses' | 'downloads' | 'financial' | 'support'

export function OrionDashboard({ data }: { data: DashboardData }) {
  const [activeView, setActiveView] = useState<ViewType>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const menuItems: Array<{ id: ViewType; label: string; icon: typeof AppWindow; badge?: number }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'applications', label: 'Aplicações', icon: AppWindow, badge: data.applications.length },
    { id: 'updates', label: 'Atualizações', icon: RefreshCw, badge: data.stats.pendingUpdates },
    { id: 'licenses', label: 'Licenças', icon: Key, badge: data.licenses.length },
    { id: 'downloads', label: 'Downloads', icon: Download },
    { id: 'financial', label: 'Financeiro', icon: CreditCard },
    { id: 'support', label: 'Suporte', icon: LifeBuoy, badge: data.stats.openTickets },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/90">
        <div className="flex h-16 items-center px-4 lg:px-6 gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1E3A8A] text-white">
              <Zap className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-tight">Orion Platform</p>
              <p className="text-xs text-slate-500 leading-tight">{data.customer.company || data.customer.name}</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {data.stats.unreadNotifications > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {data.stats.unreadNotifications}
                </Badge>
              )}
            </Button>
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-[#1E3A8A] text-white text-xs">
                {data.customer.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-16 z-30 w-64 h-[calc(100vh-4rem)] bg-white border-r border-slate-200 transition-transform duration-200 overflow-y-auto`}>
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveView(item.id); setSidebarOpen(false) }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-[#1E3A8A] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge variant={isActive ? 'secondary' : 'outline'} className="ml-auto">{item.badge}</Badge>
                  )}
                </button>
              )
            })}
          </nav>

          <Separator className="my-4" />

          {/* Status do Cliente */}
          <div className="px-4 py-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Status da Conta</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between px-3 py-1.5">
                <span className="flex items-center gap-2 text-slate-500">
                  <Shield className="h-3.5 w-3.5" />
                  MFA
                </span>
                {data.customer.mfaEnabled ? (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Ativo</Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">Inativo</Badge>
                )}
              </div>
              <div className="flex items-center justify-between px-3 py-1.5">
                <span className="flex items-center gap-2 text-slate-500">
                  <Key className="h-3.5 w-3.5" />
                  Licenças Ativas
                </span>
                <span className="font-medium text-slate-700">{data.stats.activeLicenses}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5">
                <span className="flex items-center gap-2 text-slate-500">
                  <AppWindow className="h-3.5 w-3.5" />
                  Apps Publicados
                </span>
                <span className="font-medium text-slate-700">{data.stats.publishedApps}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5">
                <span className="flex items-center gap-2 text-slate-500">
                  <HardDrive className="h-3.5 w-3.5" />
                  Armazenamento
                </span>
                <span className="font-medium text-slate-700">
                  {formatFileSize(data.stats.storageUsedMb * 1024 * 1024)} / {formatFileSize(data.stats.storageQuotaMb * 1024 * 1024)}
                </span>
              </div>
            </div>
          </div>

          {/* IA Coach */}
          <div className="px-4 pb-4 mt-4">
            <Card className="bg-[#1E3A8A] text-white border-[#1E40AF]">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <p className="text-xs font-semibold">Assistente IA</p>
                </div>
                <p className="text-xs text-slate-300 mb-3">
                  Você tem {data.stats.openTickets} chamado(s) aberto(s) e {data.stats.unreadNotifications} notificação(ões) não lida(s).
                </p>
                <Button size="sm" variant="secondary" className="w-full text-xs">Ver insights</Button>
              </CardContent>
            </Card>
          </div>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 top-16 bg-black/20 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={activeView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {activeView === 'dashboard' && <OverviewView data={data} />}
              {activeView === 'applications' && <ApplicationsView data={data} />}
              {activeView === 'updates' && <UpdatesView data={data} />}
              {activeView === 'licenses' && <LicensesView data={data} />}
              {activeView === 'downloads' && <DownloadsView data={data} />}
              {activeView === 'financial' && <FinancialView data={data} />}
              {activeView === 'support' && <SupportView data={data} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

// =================================================================
// VIEW: OVERVIEW (Dashboard principal)
// =================================================================

function OverviewView({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Visão geral da sua conta na Plataforma Orion</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={AppWindow} label="Aplicações" value={data.stats.totalApps.toString()} sub={`${data.stats.publishedApps} publicadas`} color="bg-blue-50 text-blue-700" />
        <StatCard icon={Key} label="Licenças Ativas" value={data.stats.activeLicenses.toString()} sub={`${data.stats.trialLicenses} em trial`} color="bg-emerald-50 text-emerald-700" />
        <StatCard icon={CreditCard} label="Total Investido" value={formatCurrency(data.stats.totalPaid)} sub={`${data.stats.pendingPayments} pendências`} color="bg-purple-50 text-purple-700" />
        <StatCard icon={LifeBuoy} label="Chamados Abertos" value={data.stats.openTickets.toString()} sub={`${data.stats.unreadNotifications} notificações`} color="bg-amber-50 text-amber-700" />
      </div>

      {/* Aplicações Recentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AppWindow className="h-5 w-5" />
              Aplicações Recentes
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-slate-600">Ver todas<ChevronRight className="h-4 w-4 ml-1" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.applications.slice(0, 3).map((app) => (
              <div key={app.id} className="flex items-center gap-3 p-3 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#1E3A8A] text-white">
                  <AppWindow className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{app.name}</p>
                  <p className="text-xs text-slate-500">v{app.version} • {app.niche}</p>
                </div>
                <AppStatusBadge status={app.status} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.notifications.slice(0, 5).map((n) => (
              <div key={n.id} className={`flex items-start gap-3 p-3 rounded-md ${n.read ? 'bg-slate-50' : 'bg-blue-50 border border-blue-100'}`}>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${n.read ? 'text-slate-700' : 'text-slate-900'}`}>{n.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                </div>
                <PriorityBadge priority={n.priority} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Atividade Recente (AuditLog) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.activity.map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-slate-50 transition-colors">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EFF6FF] text-[#1E3A8A]">
                  <Activity className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">{formatAction(a.action, a.entity)}</p>
                  <p className="text-xs text-slate-400">{formatDateTime(a.createdAt)}{a.ipAddress && a.ipAddress !== 'system' ? ` • IP ${a.ipAddress}` : ''}</p>
                </div>
              </div>
            ))}
            {data.activity.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-6">Nenhuma atividade registrada.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
// =================================================================
// VIEW: APLICAÇÕES
// =================================================================

function ApplicationsView({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Aplicações</h1>
        <p className="text-sm text-slate-500">Lista completa de aplicações desenvolvidas</p>
      </div>

      <div className="grid gap-4">
        {data.applications.map((app) => (
          <Card key={app.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#1E3A8A] text-white flex-shrink-0">
                  <AppWindow className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">{app.name}</h3>
                      <p className="text-sm text-slate-500">{app.description}</p>
                    </div>
                    <AppStatusBadge status={app.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><span className="font-medium text-slate-700">Versão:</span> {app.version}</span>
                    <span className="flex items-center gap-1"><span className="font-medium text-slate-700">Nicho:</span> {app.niche}</span>
                    <span className="flex items-center gap-1"><span className="font-medium text-slate-700">Complexidade:</span> {app.complexity}</span>
                    {app.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Publicada em {formatDate(app.publishedAt)}
                      </span>
                    )}
                  </div>
                  {app.features.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {app.features.map((f) => (
                        <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1E3A8A] border border-[#DBEAFE] capitalize">
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// =================================================================
// VIEW: ATUALIZAÇÕES (AppUpdate / versionamento)
// =================================================================

function UpdatesView({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Atualizações</h1>
        <p className="text-sm text-slate-500">Versionamento e changelog das suas aplicações</p>
      </div>

      <div className="grid gap-4">
        {data.appUpdates.map((up) => (
          <Card key={up.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#EFF6FF] text-[#1E3A8A] flex-shrink-0">
                  <UpdateTypeIcon type={up.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {up.applicationName} <span className="font-mono text-sm text-slate-500">v{up.version}</span>
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <UpdateTypeBadge type={up.type} />
                      <UpdateStatusBadge status={up.status} />
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">{up.changelog}</p>
                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {up.publishedAt ? `Publicada em ${formatDate(up.publishedAt)}` : `Criada em ${formatDate(up.createdAt)}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {data.appUpdates.length === 0 && (
          <Card><CardContent className="p-8 text-center text-sm text-slate-500">Nenhuma atualização registrada.</CardContent></Card>
        )}
      </div>
    </div>
  )
}

// =================================================================
// VIEW: LICENÇAS
// =================================================================

function LicensesView({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Licenças</h1>
        <p className="text-sm text-slate-500">Planos, validade e renovação</p>
      </div>

      <div className="grid gap-4">
        {data.licenses.map((lic) => (
          <Card key={lic.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Key className="h-4 w-4 text-slate-400" />
                    <span className="font-mono text-sm font-medium text-slate-900">{lic.licenseKey}</span>
                  </div>
                  <p className="text-sm text-slate-500">
                    {lic.applicationName || 'Sem aplicação vinculada'}
                  </p>
                </div>
                <LicenseStatusBadge status={lic.status} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Plano</p>
                  <p className="font-medium text-slate-900 capitalize">{lic.plan}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Validade</p>
                  <p className="font-medium text-slate-900">{lic.duration} dias</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Usuários</p>
                  <p className="font-medium text-slate-900">{lic.maxUsers}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Armazenamento</p>
                  <p className="font-medium text-slate-900">{formatFileSize(lic.storageMb * 1024 * 1024)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Valor</p>
                  <p className="font-medium text-slate-900">{lic.price > 0 ? formatCurrency(lic.price) : 'Gratuito'}</p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {lic.endDate && (
                    <span className="text-slate-500">
                      {lic.status === 'active' ? 'Expira em:' : 'Expirou em:'} <span className="font-medium text-slate-700">{formatDate(lic.endDate)}</span>
                    </span>
                  )}
                  {lic.trialEndsAt && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      <Clock className="h-3 w-3 mr-1" />
                      Trial: {formatDate(lic.trialEndsAt)}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {lic.autoRenew && (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Auto-renovação
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// =================================================================
// VIEW: DOWNLOADS
// =================================================================

function DownloadsView({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Downloads</h1>
        <p className="text-sm text-slate-500">Aplicativos disponíveis e histórico</p>
      </div>

      {/* Apps Disponíveis para Download */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Disponíveis para Download
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.applications.filter((a) => a.status === 'published').map((app) => (
              <div key={app.id} className="flex items-center gap-3 p-3 rounded-md border border-slate-200">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#1E3A8A] text-white">
                  <AppWindow className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{app.name}</p>
                  <p className="text-xs text-slate-500">v{app.version} • {app.artifactSize ? formatFileSize(app.artifactSize) : 'N/A'}</p>
                </div>
                <Button size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Downloads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico de Downloads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.downloads.map((dl) => (
              <div key={dl.id} className="flex items-center gap-3 p-3 rounded-md hover:bg-slate-50 transition-colors">
                <DownloadStatusIcon status={dl.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{dl.applicationName}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {dl.downloadedAt ? `Baixado em ${formatDate(dl.downloadedAt)}` : 'Pendente'}
                    {dl.ipAddress && ` • IP: ${dl.ipAddress}`}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {dl.status === 'completed' ? 'Concluído' : dl.status === 'expired' ? 'Expirado' : dl.status}
                </Badge>
              </div>
            ))}
            {data.downloads.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-8">Nenhum download realizado ainda.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// =================================================================
// VIEW: FINANCEIRO
// =================================================================

function FinancialView({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Financeiro</h1>
        <p className="text-sm text-slate-500">Pagamentos, notas fiscais e assinaturas</p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider mb-1">Total Pago</p>
            <p className="text-2xl font-bold text-emerald-900">{formatCurrency(data.stats.totalPaid)}</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-amber-700 uppercase tracking-wider mb-1">Pendências</p>
            <p className="text-2xl font-bold text-amber-900">{data.stats.pendingPayments}</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-blue-700 uppercase tracking-wider mb-1">Método Padrão</p>
            <p className="text-2xl font-bold text-blue-900">Cartão</p>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Pagamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Histórico de Pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.payments.map((pay) => (
              <div key={pay.id} className="flex items-center gap-3 p-3 rounded-md border border-slate-200">
                <PaymentStatusIcon status={pay.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{pay.description}</p>
                  <p className="text-xs text-slate-500">
                    {pay.method === 'card' ? 'Cartão' : pay.method === 'pix' ? 'PIX' : 'Boleto'} • {formatDate(pay.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{formatCurrency(pay.amount)}</p>
                  {pay.invoiceUrl && (
                    <a href={pay.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 justify-end">
                      <FileText className="h-3 w-3" />
                      Nota fiscal
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// =================================================================
// VIEW: SUPORTE
// =================================================================

function SupportView({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Suporte</h1>
          <p className="text-sm text-slate-500">Chamados, mensagens e documentação</p>
        </div>
        <Button>
          <LifeBuoy className="h-4 w-4 mr-2" />
          Novo Chamado
        </Button>
      </div>

      <div className="grid gap-4">
        {data.tickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-900">{ticket.subject}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {ticket.category === 'technical' ? 'Técnico' : ticket.category === 'billing' ? 'Financeiro' : ticket.category === 'license' ? 'Licença' : 'Geral'} •
                    Aberto em {formatDate(ticket.createdAt)}
                    {ticket.messageCount > 0 ? ` • ${ticket.messageCount} mensagem(ns)` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={ticket.priority} />
                  <TicketStatusBadge status={ticket.status} />
                </div>
              </div>
              {ticket.resolvedAt && (
                <p className="text-xs text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Resolvido em {formatDate(ticket.resolvedAt)}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// =================================================================
// COMPONENTS AUXILIARES
// =================================================================

function StatCard({ icon: Icon, label, value, sub, color }: { icon: typeof AppWindow; label: string; value: string; sub: string; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className={`flex h-9 w-9 items-center justify-center rounded-md ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-xl lg:text-2xl font-bold text-slate-900 mt-1">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  )
}

function AppStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    draft: { label: 'Rascunho', className: 'bg-slate-100 text-slate-700 border-slate-200' },
    backlog: { label: 'Backlog', className: 'bg-slate-100 text-slate-700 border-slate-200' },
    development: { label: 'Em Desenvolvimento', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    testing: { label: 'Em Testes', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    homologation: { label: 'Homologação', className: 'bg-purple-50 text-purple-700 border-purple-200' },
    published: { label: 'Publicada', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    updated: { label: 'Atualizada', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    archived: { label: 'Arquivada', className: 'bg-slate-100 text-slate-500 border-slate-200' },
  }
  const c = config[status] || config.draft
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>
}

function LicenseStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    created: { label: 'Criada', className: 'bg-slate-100 text-slate-700 border-slate-200' },
    pending: { label: 'Pendente', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    active: { label: 'Ativa', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    suspended: { label: 'Suspensa', className: 'bg-red-50 text-red-700 border-red-200' },
    blocked: { label: 'Bloqueada', className: 'bg-red-50 text-red-700 border-red-200' },
    cancelled: { label: 'Cancelada', className: 'bg-slate-100 text-slate-500 border-slate-200' },
    expired: { label: 'Expirada', className: 'bg-slate-100 text-slate-500 border-slate-200' },
  }
  const c = config[status] || config.created
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>
}

function TicketStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    open: { label: 'Aberto', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    in_progress: { label: 'Em Andamento', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    resolved: { label: 'Resolvido', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    closed: { label: 'Fechado', className: 'bg-slate-100 text-slate-500 border-slate-200' },
  }
  const c = config[status] || config.open
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>
}

function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { label: string; className: string }> = {
    low: { label: 'Baixa', className: 'bg-slate-100 text-slate-600 border-slate-200' },
    normal: { label: 'Normal', className: 'bg-blue-50 text-blue-600 border-blue-200' },
    high: { label: 'Alta', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    urgent: { label: 'Urgente', className: 'bg-red-50 text-red-700 border-red-200' },
  }
  const c = config[priority] || config.normal
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>
}

function DownloadStatusIcon({ status }: { status: string }) {
  if (status === 'completed') return <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
  if (status === 'expired') return <XCircle className="h-5 w-5 text-slate-400 flex-shrink-0" />
  if (status === 'revoked') return <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
  return <Clock className="h-5 w-5 text-amber-500 flex-shrink-0" />
}

function PaymentStatusIcon({ status }: { status: string }) {
  if (status === 'succeeded') return <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
  if (status === 'failed') return <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
  if (status === 'refunded') return <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
  return <Clock className="h-5 w-5 text-amber-500 flex-shrink-0" />
}

function UpdateTypeIcon({ type }: { type: string }) {
  if (type === 'security') return <ShieldCheck className="h-5 w-5" />
  if (type === 'feature') return <Sparkles className="h-5 w-5" />
  if (type === 'fix') return <Wrench className="h-5 w-5" />
  return <Package className="h-5 w-5" />
}

function UpdateTypeBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; className: string }> = {
    fix: { label: 'Correção', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    improvement: { label: 'Melhoria', className: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    feature: { label: 'Novidade', className: 'bg-violet-50 text-violet-700 border-violet-200' },
    security: { label: 'Segurança', className: 'bg-red-50 text-red-700 border-red-200' },
  }
  const c = config[type] || config.fix
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>
}

function UpdateStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pendente', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    published: { label: 'Publicada', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    rolled_back: { label: 'Revertida', className: 'bg-slate-100 text-slate-500 border-slate-200' },
  }
  const c = config[status] || config.pending
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>
}

// =================================================================
// FORMATTERS
// =================================================================

function formatAction(action: string, entity: string): string {
  const actions: Record<string, string> = {
    login: 'Acesso à conta',
    download: 'Download de artefato',
    publish: 'Publicação',
    suspend: 'Suspensão',
    cancel: 'Cancelamento',
    create: 'Criação',
    update: 'Atualização',
    delete: 'Exclusão',
  }
  const entities: Record<string, string> = {
    customer: 'da conta',
    application: 'de aplicação',
    license: 'de licença',
    payment: 'de pagamento',
    download: 'de download',
  }
  return `${actions[action] || action} ${entities[entity] || entity}`.trim()
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}
