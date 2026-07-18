'use client'

import { Clock, User, Target, CalendarDays } from 'lucide-react'
import { ApproveButton } from './ApproveButton'
import { RejectButton } from './RejectButton'

interface ResultUser {
  id: string
  name: string
  email: string | null
  avatarUrl: string | null
}

interface ResultIndicator {
  id: string
  companyId: string
  name: string
  unit: string | null
}

interface ResultGoal {
  id: string
  name: string
  indicator: ResultIndicator
}

export interface PendingResult {
  id: string
  companyId: string
  goalId: string
  userId: string
  value: number
  referenceDate: string
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'revised'
  notes: string | null
  approvedBy: string | undefined
  approvedAt: string | null
  createdBy: string | undefined
  createdAt: string
  updatedAt: string
  goal: ResultGoal
  user: ResultUser
}

const STATUS_LABEL: Record<PendingResult['status'], string> = {
  draft: 'Rascunho',
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  revised: 'Revisado'
}

function initials(name: string): string {
  return name.trim().charAt(0).toUpperCase() || 'U'
}

export function AprovacoesClient({ results }: { results: PendingResult[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {results.map((result, i) => (
        <div
          key={result.id}
          className="glass-card p-5 hover:shadow-lg transition-all animate-fade-in-up"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, rgb(99 102 241), rgb(168 85 247))' }}
              >
                {initials(result.user.name)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-white truncate">{result.user.name}</p>
                <span className="badge badge-warning mt-1 flex items-center gap-1 w-fit" style={{ fontSize: '10px' }}>
                  <Clock className="w-3 h-3" /> {STATUS_LABEL[result.status]}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl" style={{ background: 'rgb(var(--surface-1))' }}>
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-3.5 h-3.5" style={{ color: 'rgb(var(--text-muted))' }} />
                <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>Meta</p>
              </div>
              <p className="text-sm font-medium text-white truncate">{result.goal.name}</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: 'rgb(var(--text-secondary))' }}>
                {result.goal.indicator.name}
              </p>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>Valor</p>
                <p className="text-lg font-bold" style={{ color: 'rgb(var(--orion-indigo))' }}>
                  {Number(result.value).toLocaleString('pt-BR')} {result.goal.indicator.unit}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs flex items-center justify-end gap-1" style={{ color: 'rgb(var(--text-muted))' }}>
                  <CalendarDays className="w-3 h-3" /> Referência
                </p>
                <p className="text-sm font-medium text-white">
                  {new Date(result.referenceDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            {result.notes && (
              <div className="p-3 rounded-xl" style={{ background: 'rgb(var(--glass-bg))', border: '1px solid rgb(var(--glass-border))' }}>
                <p className="text-xs italic" style={{ color: 'rgb(var(--text-secondary))' }}>
                  "{result.notes}"
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 mt-3" style={{ borderTop: '1px solid rgb(var(--glass-border))' }}>
            <RejectButton resultId={result.id} />
            <ApproveButton resultId={result.id} />
          </div>
        </div>
      ))}
    </div>
  )
}
