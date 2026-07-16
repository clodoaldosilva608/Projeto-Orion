import { getCompanyAction } from '@/modules/companies/services/company.actions'
import { listUsersAction } from '@/modules/users/services/users.actions'
import { Building2, Mail, Phone, Globe, MapPin, Crown, Users, Calendar, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Orion — Empresa' }

const PLAN_MAP: Record<string, { label: string; color: string }> = {
  free: { label: 'Gratuito', color: 'text-gray-400' },
  starter: { label: 'Starter', color: 'text-blue-400' },
  pro: { label: 'Pro', color: 'text-indigo-400' },
  enterprise: { label: 'Enterprise', color: 'text-amber-400' },
  custom: { label: 'Personalizado', color: 'text-purple-400' },
}

function InfoRow({ label, value, icon: Icon }: { label: string; value: string | null | undefined; icon?: React.ElementType }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-3" style={{ borderBottom: '1px solid rgb(var(--glass-border))' }}>
      {Icon && <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'rgb(var(--text-muted))' }} />}
      <div className="flex-1 min-w-0">
        <p className="text-xs mb-0.5" style={{ color: 'rgb(var(--text-muted))' }}>{label}</p>
        <p className="text-sm font-medium text-white break-words">{value}</p>
      </div>
    </div>
  )
}

export default async function EmpresaPage() {
  const [companyRes, usersRes] = await Promise.all([
    getCompanyAction(),
    listUsersAction()
  ])

  const company = companyRes.data
  const users = usersRes.data ?? []

  if (!company) {
    return (
      <div className="p-6">
        <div className="rounded-xl p-4 text-sm text-rose-400" style={{ background: 'rgb(244 63 94 / 0.1)', border: '1px solid rgb(244 63 94 / 0.2)' }}>
          {companyRes.error ?? 'Empresa não encontrada'}
        </div>
      </div>
    )
  }

  const planInfo = PLAN_MAP[company.plan] ?? PLAN_MAP['free']
  const activeUsers = users.filter(u => u.status === 'active').length
  const address = [company.address, company.addressNumber, company.district, company.city, company.state]
    .filter(Boolean).join(', ')

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-400" />
            Dados da Empresa
          </h1>
          <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
            Informações cadastrais da sua organização
          </p>
        </div>
        <Link
          href="/configuracoes"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'rgb(var(--surface-2))', color: 'rgb(var(--text-secondary))', border: '1px solid rgb(var(--glass-border))' }}
        >
          Editar <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-4 text-center">
          <Crown className="w-5 h-5 mx-auto mb-1" style={{ color: 'rgb(var(--orion-amber))' }} />
          <p className={`text-lg font-bold ${planInfo.color}`}>{planInfo.label}</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>Plano</p>
        </div>
        <div className="glass-card p-4 text-center">
          <Users className="w-5 h-5 mx-auto mb-1 text-indigo-400" />
          <p className="text-lg font-bold text-white">{users.length}</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>Membros</p>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <p className="text-lg font-bold text-emerald-400">{activeUsers}</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>Ativos</p>
        </div>
        <div className="glass-card p-4 text-center">
          <Calendar className="w-5 h-5 mx-auto mb-1" style={{ color: 'rgb(var(--text-muted))' }} />
          <p className="text-lg font-bold text-white">
            {new Date(company.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>Desde</p>
        </div>
      </div>

      {/* Dados principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Identificação */}
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" /> Identificação
          </h2>
          <div className="divide-y" style={{ borderColor: 'transparent' }}>
            <InfoRow label="Nome Fantasia" value={company.tradeName} />
            <InfoRow label="Razão Social" value={company.legalName} />
            <InfoRow label="CNPJ" value={company.cnpj} />
            <InfoRow label="Idioma" value={{ pt: 'Português', en: 'Inglês', es: 'Espanhol' }[company.language] ?? company.language} />
            <InfoRow label="Moeda" value={company.currency} />
            <InfoRow label="Fuso Horário" value={company.timezone} />
          </div>
        </div>

        {/* Contato */}
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-400" /> Contato & Localização
          </h2>
          <div className="divide-y" style={{ borderColor: 'transparent' }}>
            <InfoRow label="E-mail" value={company.email} icon={Mail} />
            <InfoRow label="Telefone" value={company.phone} icon={Phone} />
            <InfoRow label="Website" value={company.website} icon={Globe} />
            <InfoRow label="Endereço" value={address || null} icon={MapPin} />
            {company.zipCode && <InfoRow label="CEP" value={company.zipCode} />}
          </div>

          {(!company.email && !company.phone && !company.website && !address) && (
            <div className="py-6 text-center">
              <p className="text-sm" style={{ color: 'rgb(var(--text-muted))' }}>
                Nenhum dado de contato cadastrado.{' '}
                <Link href="/configuracoes" className="text-indigo-400 hover:underline">
                  Configurar agora
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
