'use client'

import { useState, useTransition } from 'react'
import { updateCompanyAction } from '@/modules/companies/services/company.actions'
import {
  Building2, Globe, Phone, Mail, MapPin, Clock, Save,
  Loader2, CheckCircle2, ChevronRight, Settings, Palette, Bell
} from 'lucide-react'

interface Company {
  id: string
  legalName: string
  tradeName: string
  cnpj: string | null
  email: string | null
  phone: string | null
  website: string | null
  address: string | null
  addressNumber: string | null
  complement: string | null
  district: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  timezone: string
  currency: string
  language: string
  plan: string
}

interface Props {
  company: Company
}

type Tab = 'empresa' | 'aparencia' | 'notificacoes'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'empresa', label: 'Empresa', icon: Building2 },
  { id: 'aparencia', label: 'Aparência', icon: Palette },
  { id: 'notificacoes', label: 'Notificações', icon: Bell },
]

export default function ConfiguracoesClient({ company }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('empresa')
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    tradeName: company.tradeName ?? '',
    legalName: company.legalName ?? '',
    cnpj: company.cnpj ?? '',
    email: company.email ?? '',
    phone: company.phone ?? '',
    website: company.website ?? '',
    address: company.address ?? '',
    addressNumber: company.addressNumber ?? '',
    complement: company.complement ?? '',
    district: company.district ?? '',
    city: company.city ?? '',
    state: company.state ?? '',
    zipCode: company.zipCode ?? '',
    timezone: company.timezone ?? 'America/Sao_Paulo',
    currency: company.currency ?? 'BRL',
    language: company.language ?? 'pt',
  })

  function handleChange(key: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)

    startTransition(async () => {
      const result = await updateCompanyAction(form)
      if (result.error) {
        setError(result.error)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    })
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          Configurações
        </h1>
        <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
          Gerencie as configurações da sua organização
        </p>
      </div>

      {/* Tab Bar */}
      <div
        className="flex items-center gap-1 p-1 rounded-xl w-fit"
        style={{ background: 'rgb(var(--surface-1))' }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: activeTab === tab.id ? 'rgb(var(--orion-indigo) / 0.2)' : 'transparent',
                color: activeTab === tab.id ? 'rgb(var(--orion-indigo))' : 'rgb(var(--text-muted))',
                border: activeTab === tab.id ? '1px solid rgb(var(--orion-indigo) / 0.3)' : '1px solid transparent',
              }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Empresa */}
      {activeTab === 'empresa' && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Dados Básicos */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="font-semibold text-white text-sm flex items-center gap-2 pb-3" style={{ borderBottom: '1px solid rgb(var(--glass-border))' }}>
              <Building2 className="w-4 h-4 text-indigo-400" /> Dados da Empresa
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>Nome Fantasia *</label>
                <input type="text" value={form.tradeName} onChange={e => handleChange('tradeName', e.target.value)} className="input-field" required />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>Razão Social</label>
                <input type="text" value={form.legalName} onChange={e => handleChange('legalName', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>CNPJ</label>
                <input type="text" value={form.cnpj} onChange={e => handleChange('cnpj', e.target.value)} placeholder="00.000.000/0000-00" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>Plano Atual</label>
                <div
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
                  style={{ background: 'rgb(var(--surface-2))', color: 'rgb(var(--text-muted))' }}
                >
                  <span className="capitalize">{company.plan}</span>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgb(99 102 241 / 0.2)', color: 'rgb(var(--orion-indigo))' }}>
                    Atual
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="font-semibold text-white text-sm flex items-center gap-2 pb-3" style={{ borderBottom: '1px solid rgb(var(--glass-border))' }}>
              <Mail className="w-4 h-4 text-indigo-400" /> Contato
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>E-mail</label>
                <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>Telefone</label>
                <input type="text" value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="(00) 00000-0000" className="input-field" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgb(var(--text-muted))' }} />
                  <input type="url" value={form.website} onChange={e => handleChange('website', e.target.value)} placeholder="https://empresa.com" className="input-field pl-9" />
                </div>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="font-semibold text-white text-sm flex items-center gap-2 pb-3" style={{ borderBottom: '1px solid rgb(var(--glass-border))' }}>
              <MapPin className="w-4 h-4 text-indigo-400" /> Endereço
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>Logradouro</label>
                <input type="text" value={form.address} onChange={e => handleChange('address', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>Número</label>
                <input type="text" value={form.addressNumber} onChange={e => handleChange('addressNumber', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>Bairro</label>
                <input type="text" value={form.district} onChange={e => handleChange('district', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>Cidade</label>
                <input type="text" value={form.city} onChange={e => handleChange('city', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>Estado</label>
                <input type="text" value={form.state} onChange={e => handleChange('state', e.target.value)} placeholder="SP" maxLength={2} className="input-field uppercase" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>CEP</label>
                <input type="text" value={form.zipCode} onChange={e => handleChange('zipCode', e.target.value)} placeholder="00000-000" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>Complemento</label>
                <input type="text" value={form.complement} onChange={e => handleChange('complement', e.target.value)} className="input-field" />
              </div>
            </div>
          </div>

          {/* Preferências */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="font-semibold text-white text-sm flex items-center gap-2 pb-3" style={{ borderBottom: '1px solid rgb(var(--glass-border))' }}>
              <Clock className="w-4 h-4 text-indigo-400" /> Preferências Regionais
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>Fuso Horário</label>
                <select value={form.timezone} onChange={e => handleChange('timezone', e.target.value)} className="input-field">
                  <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                  <option value="America/Manaus">Manaus (GMT-4)</option>
                  <option value="America/Belem">Belém (GMT-3)</option>
                  <option value="America/Fortaleza">Fortaleza (GMT-3)</option>
                  <option value="America/Recife">Recife (GMT-3)</option>
                  <option value="America/Porto_Velho">Porto Velho (GMT-4)</option>
                  <option value="America/Boa_Vista">Boa Vista (GMT-4)</option>
                  <option value="America/Rio_Branco">Rio Branco (GMT-5)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>Moeda</label>
                <select value={form.currency} onChange={e => handleChange('currency', e.target.value)} className="input-field">
                  <option value="BRL">BRL — Real Brasileiro</option>
                  <option value="USD">USD — Dólar Americano</option>
                  <option value="EUR">EUR — Euro</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>Idioma</label>
                <select value={form.language} onChange={e => handleChange('language', e.target.value)} className="input-field">
                  <option value="pt">Português</option>
                  <option value="en">Inglês</option>
                  <option value="es">Espanhol</option>
                </select>
              </div>
            </div>
          </div>

          {/* Feedback */}
          {error && (
            <p className="text-sm text-rose-400 text-center">{error}</p>
          )}

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="btn-gradient flex items-center gap-2 min-w-[160px] justify-center"
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin relative z-10" /><span>Salvando...</span></>
              ) : saved ? (
                <><CheckCircle2 className="w-4 h-4 relative z-10" /><span>Salvo!</span></>
              ) : (
                <><Save className="w-4 h-4 relative z-10" /><span>Salvar Alterações</span></>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Tab Aparência */}
      {activeTab === 'aparencia' && (
        <div className="glass-card p-8 text-center">
          <Palette className="w-10 h-10 mx-auto mb-3 text-indigo-400 opacity-60" />
          <h3 className="font-semibold text-white mb-1">Personalização Visual</h3>
          <p className="text-sm" style={{ color: 'rgb(var(--text-muted))' }}>
            Customização de temas, cores e logo em breve. O Orion usará o tema padrão por enquanto.
          </p>
        </div>
      )}

      {/* Tab Notificações */}
      {activeTab === 'notificacoes' && (
        <div className="glass-card p-8 text-center">
          <Bell className="w-10 h-10 mx-auto mb-3 text-indigo-400 opacity-60" />
          <h3 className="font-semibold text-white mb-1">Central de Notificações</h3>
          <p className="text-sm" style={{ color: 'rgb(var(--text-muted))' }}>
            Configurações de alertas por e-mail e push em breve. Você receberá notificações padrão por agora.
          </p>
        </div>
      )}
    </div>
  )
}
