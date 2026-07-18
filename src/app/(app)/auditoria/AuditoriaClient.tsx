'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, History, User, Table2, Hash, Clock, Globe, Monitor } from 'lucide-react'

export interface AuditUser {
  id: string
  name: string
  email: string | null
  avatarUrl: string | null
}

export interface AuditLogItem {
  id: string
  companyId: string
  userId: string | null
  action: string
  tableName: string
  recordId: string | null
  recordUuid: string | null
  oldValue: unknown
  newValue: unknown
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  user: AuditUser | null
}

const ACTION_LABEL: Record<string, string> = {
  create: 'Criação',
  update: 'Edição',
  delete: 'Exclusão',
  restore: 'Restauração',
  login: 'Login',
  logout: 'Logout',
  export: 'Exportação',
  import: 'Importação',
  config: 'Configuração'
}

const ACTION_BADGE: Record<string, string> = {
  create: 'rgb(16 185 129 / 0.15)',
  update: 'rgb(99 102 241 / 0.15)',
  delete: 'rgb(244 63 94 / 0.15)',
  restore: 'rgb(6 182 212 / 0.15)',
  login: 'rgb(168 85 247 / 0.15)',
  logout: 'rgb(168 85 247 / 0.15)',
  export: 'rgb(234 179 8 / 0.15)',
  import: 'rgb(234 179 8 / 0.15)',
  config: 'rgb(148 163 184 / 0.15)'
}

const ACTION_TEXT: Record<string, string> = {
  create: 'rgb(16 185 129)',
  update: 'rgb(99 102 241)',
  delete: 'rgb(244 63 94)',
  restore: 'rgb(6 182 212)',
  login: 'rgb(168 85 247)',
  logout: 'rgb(168 85 247)',
  export: 'rgb(234 179 8)',
  import: 'rgb(234 179 8)',
  config: 'rgb(148 163 184)'
}

function initials(name: string): string {
  return name.trim().charAt(0).toUpperCase() || 'U'
}

function safeStringify(value: unknown): string {
  if (value === null || value === undefined) return '—'
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function JsonBlock({ label, value, color }: { label: string; value: unknown; color: string }) {
  if (value === null || value === undefined) return null
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-lg overflow-hidden" style={{ background: 'rgb(var(--surface-1))' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-1.5 px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-white/5"
        style={{ color }}
      >
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        {label}
      </button>
      {open && (
        <pre className="px-3 pb-3 text-[11px] leading-relaxed overflow-x-auto" style={{ color: 'rgb(var(--text-secondary))' }}>
          {safeStringify(value)}
        </pre>
      )}
    </div>
  )
}

function AuditRow({ log }: { log: AuditLogItem }) {
  const [openDetails, setOpenDetails] = useState(false)
  const badgeBg = ACTION_BADGE[log.action] ?? 'rgb(148 163 184 / 0.15)'
  const badgeText = ACTION_TEXT[log.action] ?? 'rgb(148 163 184)'

  return (
    <div className="glass-card p-4 animate-fade-in-up">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span
            className="badge flex items-center gap-1 shrink-0 mt-0.5"
            style={{ background: badgeBg, color: badgeText }}
          >
            {ACTION_LABEL[log.action] ?? log.action}
          </span>
          <div className="min-w-0">
            <p className="text-sm text-white font-medium flex items-center gap-1.5 flex-wrap">
              <Table2 className="w-3.5 h-3.5" style={{ color: 'rgb(var(--text-muted))' }} />
              {log.tableName}
              {log.recordId && (
                <span className="flex items-center gap-1 text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
                  <Hash className="w-3 h-3" />{log.recordId}
                </span>
              )}
            </p>
            <div className="flex items-center gap-3 mt-1 flex-wrap text-xs" style={{ color: 'rgb(var(--text-secondary))' }}>
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {log.user?.name ?? 'Sistema'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(log.createdAt).toLocaleString('pt-BR')}
              </span>
              {log.ipAddress && (
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {log.ipAddress}
                </span>
              )}
              {log.userAgent && (
                <span className="flex items-center gap-1 truncate max-w-[220px]">
                  <Monitor className="w-3 h-3" />
                  {log.userAgent}
                </span>
              )}
            </div>
          </div>
        </div>

        {(log.oldValue !== null || log.newValue !== null) && (
          <button
            type="button"
            onClick={() => setOpenDetails((o) => !o)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors shrink-0"
            style={{ background: 'rgb(var(--surface-2))', color: 'rgb(var(--text-secondary))' }}
          >
            <History className="w-3.5 h-3.5" />
            {openDetails ? 'Ocultar' : 'Detalhes'}
          </button>
        )}
      </div>

      {openDetails && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4" style={{ borderTop: '1px solid rgb(var(--glass-border))' }}>
          <JsonBlock label="Valor Anterior" value={log.oldValue} color="rgb(244 63 94)" />
          <JsonBlock label="Valor Novo" value={log.newValue} color="rgb(16 185 129)" />
        </div>
      )}
    </div>
  )
}

export function AuditoriaClient({
  logs,
  tables,
  actions
}: {
  logs: AuditLogItem[]
  tables: string[]
  actions: string[]
}) {
  const [tableFilter, setTableFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      if (tableFilter && log.tableName !== tableFilter) return false
      if (actionFilter && log.action !== actionFilter) return false
      return true
    })
  }, [logs, tableFilter, actionFilter])

  const selectClass =
    'orion-input appearance-none bg-no-repeat text-sm px-3 py-2'
  const chevron =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23a0a0c8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")"

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
            Tabela
          </label>
          <select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            className={selectClass}
            style={{ backgroundImage: chevron, backgroundPosition: 'right 12px center' }}
          >
            <option value="">Todas as tabelas</option>
            {tables.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
            Ação
          </label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className={selectClass}
            style={{ backgroundImage: chevron, backgroundPosition: 'right 12px center' }}
          >
            <option value="">Todas as ações</option>
            {actions.map((a) => (
              <option key={a} value={a}>{ACTION_LABEL[a] ?? a}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => { setTableFilter(''); setActionFilter('') }}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{ background: 'rgb(var(--surface-2))', color: 'rgb(var(--text-secondary))' }}
        >
          Limpar
        </button>
      </div>

      <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
        Exibindo {filtered.length} de {logs.length} registros
      </p>

      {filtered.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="text-sm" style={{ color: 'rgb(var(--text-muted))' }}>
            Nenhum log corresponde aos filtros selecionados.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((log) => (
            <AuditRow key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  )
}
