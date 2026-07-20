'use client'

/**
 * Badges e componentes de status enterprise-grade
 */
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2, Clock, AlertCircle, XCircle, Pause, Lock, Archive,
  Code2, FlaskConical, ClipboardCheck, Rocket, RefreshCw, FileEdit,
} from 'lucide-react'

// =====================================================
// Status Dot (ponto colorido + label)
// =====================================================

export function StatusDot({ status, color }: { status: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-2 w-2 rounded-full ring-2 ring-offset-1"
        style={{ backgroundColor: color, '--tw-ring-color': `${color}30` } as React.CSSProperties}
      />
      <span className="text-xs font-medium text-slate-700 capitalize">{status}</span>
    </div>
  )
}

// =====================================================
// App Status Badge (com ícone)
// =====================================================

const APP_STATUS_CONFIG: Record<string, { label: string; className: string; icon: typeof Code2; dotColor: string }> = {
  draft: { label: 'Rascunho', className: 'bg-slate-100 text-slate-600 border-slate-200', icon: FileEdit, dotColor: '#64748B' },
  backlog: { label: 'Backlog', className: 'bg-slate-100 text-slate-600 border-slate-200', icon: Clock, dotColor: '#64748B' },
  development: { label: 'Em Desenvolvimento', className: 'bg-blue-50 text-blue-700 border-blue-200', icon: Code2, dotColor: '#3B82F6' },
  testing: { label: 'Em Testes', className: 'bg-amber-50 text-amber-700 border-amber-200', icon: FlaskConical, dotColor: '#F59E0B' },
  homologation: { label: 'Homologação', className: 'bg-purple-50 text-purple-700 border-purple-200', icon: ClipboardCheck, dotColor: '#8B5CF6' },
  published: { label: 'Publicada', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Rocket, dotColor: '#10B981' },
  updated: { label: 'Atualizada', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: RefreshCw, dotColor: '#10B981' },
  archived: { label: 'Arquivada', className: 'bg-slate-100 text-slate-400 border-slate-200', icon: Archive, dotColor: '#94A3B8' },
}

export function AppStatusBadge({ status, withIcon = false }: { status: string; withIcon?: boolean }) {
  const config = APP_STATUS_CONFIG[status] || APP_STATUS_CONFIG.draft
  const Icon = config.icon

  if (withIcon) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium" style={{ backgroundColor: `${config.dotColor}10`, color: config.dotColor, borderColor: `${config.dotColor}30` }}>
        <Icon className="h-3 w-3" />
        {config.label}
      </div>
    )
  }

  return <Badge variant="outline" className={config.className}>{config.label}</Badge>
}

// =====================================================
// License Status Badge
// =====================================================

const LICENSE_STATUS_CONFIG: Record<string, { label: string; className: string; dotColor: string }> = {
  created: { label: 'Criada', className: 'bg-slate-100 text-slate-600 border-slate-200', dotColor: '#64748B' },
  pending: { label: 'Pendente', className: 'bg-amber-50 text-amber-700 border-amber-200', dotColor: '#F59E0B' },
  active: { label: 'Ativa', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: '#10B981' },
  suspended: { label: 'Suspensa', className: 'bg-red-50 text-red-700 border-red-200', dotColor: '#EF4444' },
  blocked: { label: 'Bloqueada', className: 'bg-red-50 text-red-700 border-red-200', dotColor: '#DC2626' },
  cancelled: { label: 'Cancelada', className: 'bg-slate-100 text-slate-400 border-slate-200', dotColor: '#94A3B8' },
  expired: { label: 'Expirada', className: 'bg-slate-100 text-slate-400 border-slate-200', dotColor: '#94A3B8' },
}

export function LicenseStatusBadge({ status }: { status: string }) {
  const config = LICENSE_STATUS_CONFIG[status] || LICENSE_STATUS_CONFIG.created
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium" style={{ backgroundColor: `${config.dotColor}10`, color: config.dotColor, borderColor: `${config.dotColor}30` }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: config.dotColor }} />
      {config.label}
    </div>
  )
}

// =====================================================
// Plan Badge
// =====================================================

const PLAN_CONFIG: Record<string, { label: string; className: string }> = {
  starter: { label: 'Starter', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  professional: { label: 'Professional', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  enterprise: { label: 'Enterprise', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  trial: { label: 'Trial', className: 'bg-amber-50 text-amber-700 border-amber-200' },
}

export function PlanBadge({ plan }: { plan: string }) {
  const config = PLAN_CONFIG[plan] || PLAN_CONFIG.starter
  return <Badge variant="outline" className={`capitalize ${config.className}`}>{config.label}</Badge>
}

// =====================================================
// Ticket Status Badge
// =====================================================

const TICKET_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  open: { label: 'Aberto', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  in_progress: { label: 'Em Andamento', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  resolved: { label: 'Resolvido', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  closed: { label: 'Fechado', className: 'bg-slate-100 text-slate-500 border-slate-200' },
}

export function TicketStatusBadge({ status }: { status: string }) {
  const config = TICKET_STATUS_CONFIG[status] || TICKET_STATUS_CONFIG.open
  return <Badge variant="outline" className={config.className}>{config.label}</Badge>
}

// =====================================================
// Priority Badge
// =====================================================

const PRIORITY_CONFIG: Record<string, { label: string; className: string }> = {
  low: { label: 'Baixa', className: 'bg-slate-100 text-slate-600 border-slate-200' },
  normal: { label: 'Normal', className: 'bg-blue-50 text-blue-600 border-blue-200' },
  high: { label: 'Alta', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  urgent: { label: 'Urgente', className: 'bg-red-50 text-red-700 border-red-200' },
}

export function PriorityBadge({ priority }: { priority: string }) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.normal
  return <Badge variant="outline" className={config.className}>{config.label}</Badge>
}

// =====================================================
// Payment Status Icon
// =====================================================

export function PaymentStatusIcon({ status }: { status: string }) {
  const icons: Record<string, { icon: typeof CheckCircle2; color: string }> = {
    succeeded: { icon: CheckCircle2, color: 'text-emerald-600' },
    failed: { icon: XCircle, color: 'text-red-500' },
    refunded: { icon: AlertCircle, color: 'text-amber-500' },
    pending: { icon: Clock, color: 'text-amber-500' },
    canceled: { icon: XCircle, color: 'text-slate-400' },
  }
  const { icon: Icon, color } = icons[status] || icons.pending
  return <Icon className={`h-5 w-5 ${color} flex-shrink-0`} />
}

// =====================================================
// Download Status Icon
// =====================================================

export function DownloadStatusIcon({ status }: { status: string }) {
  const icons: Record<string, { icon: typeof CheckCircle2; color: string }> = {
    completed: { icon: CheckCircle2, color: 'text-emerald-600' },
    expired: { icon: Clock, color: 'text-slate-400' },
    revoked: { icon: Lock, color: 'text-red-500' },
    pending: { icon: Clock, color: 'text-amber-500' },
  }
  const { icon: Icon, color } = icons[status] || icons.pending
  return <Icon className={`h-5 w-5 ${color} flex-shrink-0`} />
}

// =====================================================
// Complexity Badge
// =====================================================

export function ComplexityBadge({ complexity }: { complexity: string }) {
  const config: Record<string, { label: string; className: string; dots: number }> = {
    low: { label: 'Baixa', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dots: 1 },
    medium: { label: 'Média', className: 'bg-blue-50 text-blue-700 border-blue-200', dots: 2 },
    high: { label: 'Alta', className: 'bg-amber-50 text-amber-700 border-amber-200', dots: 3 },
    enterprise: { label: 'Enterprise', className: 'bg-purple-50 text-purple-700 border-purple-200', dots: 4 },
  }
  const c = config[complexity] || config.medium
  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 w-1 rounded-full ${i <= c.dots ? '' : 'bg-slate-200'}`}
            style={i <= c.dots ? { backgroundColor: c.className.includes('emerald') ? '#10B981' : c.className.includes('blue') ? '#3B82F6' : c.className.includes('amber') ? '#F59E0B' : '#8B5CF6' } : {}}
          />
        ))}
      </div>
      <span className="text-xs text-slate-600">{c.label}</span>
    </div>
  )
}
