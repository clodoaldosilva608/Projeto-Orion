'use client'

import { useState } from 'react'
import { CalendarClock, Users, Building2, BarChart3, KeyRound } from 'lucide-react'
import {
  type SerializedLicense,
  type LicenseStatus
} from '@/modules/licensing/services/licensing.actions'
import { ActivateLicenseForm } from './ActivateLicenseForm'
import { RenewButton } from './RenewButton'
import { RevokeButton } from './RevokeButton'

const STATUS_CONFIG: Record<LicenseStatus, { label: string; color: string; bg: string }> = {
  trial: { label: 'Trial', color: 'rgb(234 179 8)', bg: 'rgb(234 179 8 / 0.15)' },
  active: { label: 'Ativa', color: 'rgb(16 185 129)', bg: 'rgb(16 185 129 / 0.15)' },
  suspended: { label: 'Suspensa', color: 'rgb(244 63 94)', bg: 'rgb(244 63 94 / 0.15)' },
  expired: { label: 'Expirada', color: 'rgb(244 63 94)', bg: 'rgb(244 63 94 / 0.15)' },
  canceled: { label: 'Cancelada', color: 'rgb(244 63 94)', bg: 'rgb(244 63 94 / 0.15)' }
}

const PLAN_LABEL: Record<string, string> = {
  free: 'Gratuito',
  starter: 'Iniciante',
  pro: 'Profissional',
  enterprise: 'Empresarial',
  custom: 'Personalizado'
}

function daysUntil(dateISO: string): number {
  const target = new Date(dateISO).getTime()
  const now = Date.now()
  const diff = target - now
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function formatDate(dateISO: string): string {
  return new Date(dateISO).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function LicencasClient({ license }: { license: SerializedLicense | null }) {
  const [localLicense, setLocalLicense] = useState<SerializedLicense | null>(license)

  if (!localLicense) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-card p-8 text-center">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ background: 'rgb(var(--surface-2))' }}
          >
            <KeyRound className="w-8 h-8" style={{ color: 'rgb(var(--text-muted))' }} />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Nenhuma licença ativa</h3>
          <p className="text-sm mb-6" style={{ color: 'rgb(var(--text-secondary))' }}>
            Sua empresa ainda não possui uma licença ativada. Ative uma chave para liberar todos os recursos.
          </p>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <KeyRound className="w-5 h-5" style={{ color: 'rgb(var(--orion-indigo))' }} />
            Ativar licença
          </h3>
          <ActivateLicenseForm onActivated={setLocalLicense} />
        </div>
      </div>
    )
  }

  const cfg = STATUS_CONFIG[localLicense.status] ?? STATUS_CONFIG.trial
  const daysLeft = daysUntil(localLicense.expirationDate)
  const isExpired = daysLeft <= 0

  return (
    <div className="space-y-5">
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, rgb(99 102 241), rgb(168 85 247))' }}
            >
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Plano {PLAN_LABEL[localLicense.plan] ?? localLicense.plan}
              </h2>
              <span
                className="badge mt-1 uppercase"
                style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}` }}
              >
                {cfg.label}
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>Dias restantes</p>
            <p
              className="text-3xl font-bold"
              style={{ color: isExpired ? 'rgb(244 63 94)' : 'rgb(16 185 129)' }}
            >
              {daysLeft}
            </p>
          </div>
        </div>

        {/* Limites */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <LimitCard icon={<Users className="w-5 h-5" />} label="Usuários" value={localLicense.maxUsers} />
          <LimitCard icon={<Building2 className="w-5 h-5" />} label="Filiais" value={localLicense.maxBranches} />
          <LimitCard icon={<BarChart3 className="w-5 h-5" />} label="Indicadores" value={localLicense.maxIndicators} />
        </div>

        {/* Datas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl" style={{ background: 'rgb(var(--surface-1))' }}>
          <DateField label="Início" value={formatDate(localLicense.startDate)} />
          <DateField label="Expiração" value={formatDate(localLicense.expirationDate)} highlight={isExpired} />
          <DateField
            label="Fim do trial"
            value={localLicense.trialEndsAt ? formatDate(localLicense.trialEndsAt) : '—'}
          />
        </div>

        {/* Ações */}
        <div className="flex flex-wrap items-center gap-3 pt-6 mt-2" style={{ borderTop: '1px solid rgb(var(--glass-border))' }}>
          <RenewButton licenseId={localLicense.id} />
          <RevokeButton licenseId={localLicense.id} />
        </div>
      </div>

      {/* Ativar / trocar chave */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
          <CalendarClock className="w-5 h-5" style={{ color: 'rgb(var(--orion-indigo))' }} />
          Trocar ou reativar chave
        </h3>
        <p className="text-sm mb-4" style={{ color: 'rgb(var(--text-secondary))' }}>
          Insira uma nova chave de licença para reativar ou alterar o plano.
        </p>
        <ActivateLicenseForm onActivated={setLocalLicense} />
      </div>
    </div>
  )
}

function LimitCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: 'rgb(var(--surface-1))' }}>
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ background: 'rgb(var(--orion-indigo) / 0.15)', color: 'rgb(var(--orion-indigo))' }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>{label}</p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  )
}

function DateField({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs flex items-center gap-1" style={{ color: 'rgb(var(--text-muted))' }}>
        <CalendarClock className="w-3.5 h-3.5" />
        {label}
      </p>
      <p
        className="font-medium text-white mt-0.5"
        style={highlight ? { color: 'rgb(244 63 94)' } : undefined}
      >
        {value}
      </p>
    </div>
  )
}
