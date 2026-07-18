import { listAuditLogsAction, getAuditStatsAction } from '@/modules/audit/services/audit.actions'
import { AlertCircle, ScrollText } from 'lucide-react'
import { AuditoriaClient } from './AuditoriaClient'

export default async function AuditoriaPage() {
  const [logsRes, statsRes] = await Promise.all([
    listAuditLogsAction(),
    getAuditStatsAction()
  ])

  if (logsRes.error) {
    return (
      <div className="p-6">
        <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'rgb(244 63 94 / 0.1)', border: '1px solid rgb(244 63 94 / 0.3)' }}>
          <AlertCircle className="w-5 h-5 text-rose-500" />
          <p className="text-sm text-rose-500">{logsRes.error}</p>
        </div>
      </div>
    )
  }

  const logs = logsRes.data ?? []
  const stats = statsRes.data ?? { total: 0, byAction: [], byTable: [] }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Auditoria</h1>
        <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
          Histórico de ações realizadas na plataforma pela sua empresa.
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>Total de registros</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.total.toLocaleString('pt-BR')}</p>
        </div>
        {stats.byAction.slice(0, 3).map((item) => (
          <div className="glass-card p-4" key={item.key}>
            <p className="text-xs capitalize" style={{ color: 'rgb(var(--text-muted))' }}>
              {item.key}
            </p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'rgb(var(--orion-indigo))' }}>
              {item.count.toLocaleString('pt-BR')}
            </p>
          </div>
        ))}
      </div>

      {logs.length === 0 ? (
        <div className="glass-card p-12 text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'rgb(var(--surface-2))' }}>
            <ScrollText className="w-8 h-8" style={{ color: 'rgb(var(--text-muted))' }} />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Nenhum log encontrado</h3>
          <p className="text-sm max-w-md mx-auto" style={{ color: 'rgb(var(--text-secondary))' }}>
            As ações dos usuários (criação, edição, exclusão) serão registradas aqui automaticamente.
          </p>
        </div>
      ) : (
        <AuditoriaClient
          logs={logs}
          tables={stats.byTable.map((t) => t.key)}
          actions={stats.byAction.map((a) => a.key)}
        />
      )}
    </div>
  )
}
