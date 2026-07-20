'use client'

/**
 * Modais de criação para o Orion Admin
 * Conforme Documento 29, Seções 4, 9
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UserPlus, AppWindow, Key, Rocket, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// =====================================================
// MODAL BASE
// =====================================================

function ModalBase({ open, onClose, title, icon: Icon, children, footer }: {
  open: boolean
  onClose: () => void
  title: string
  icon: typeof UserPlus
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  if (!open) return null
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
                <Icon className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {children}
          </div>
          {footer && (
            <div className="flex gap-2 px-5 py-4 bg-slate-50 border-t border-slate-100">
              {footer}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// =====================================================
// CREATE CUSTOMER MODAL
// =====================================================

export function CreateCustomerModal({ open, onClose, onSubmit }: {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}) {
  const [form, setForm] = useState({ name: '', email: '', company: '', niche: '', phone: '' })

  const handleSubmit = () => {
    if (!form.name || !form.email) return
    onSubmit(form)
    setForm({ name: '', email: '', company: '', niche: '', phone: '' })
  }

  return (
    <ModalBase
      open={open}
      onClose={onClose}
      title="Novo Cliente"
      icon={UserPlus}
      footer={
        <>
          <Button variant="outline" size="sm" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button size="sm" className="flex-1" onClick={handleSubmit} disabled={!form.name || !form.email}>
            <UserPlus className="h-4 w-4 mr-1.5" />
            Criar Cliente
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Nome *</Label>
            <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="João Silva" className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">E-mail *</Label>
            <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="joao@empresa.com" className="h-9 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Empresa</Label>
            <Input value={form.company} onChange={e => setForm({...form, company: e.target.value})} placeholder="Empresa LTDA" className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Nicho</Label>
            <Input value={form.niche} onChange={e => setForm({...form, niche: e.target.value})} placeholder="Farmácia, Varejo..." className="h-9 text-sm" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Telefone</Label>
          <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="(11) 3333-4444" className="h-9 text-sm" />
        </div>
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
          <p className="text-xs text-blue-700">
            ℹ️ Após a criação, o cliente receberá um e-mail de convite para configurar sua senha e acessar a plataforma.
          </p>
        </div>
      </div>
    </ModalBase>
  )
}

// =====================================================
// CREATE APPLICATION MODAL
// =====================================================

export function CreateApplicationModal({ open, onClose, onSubmit, customers }: {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  customers: Array<{ id: string; name: string; company: string | null }>
}) {
  const [form, setForm] = useState({ customerId: '', name: '', description: '', niche: '', objective: '', complexity: 'medium' })

  const handleSubmit = () => {
    if (!form.customerId || !form.name) return
    onSubmit(form)
    setForm({ customerId: '', name: '', description: '', niche: '', objective: '', complexity: 'medium' })
  }

  return (
    <ModalBase
      open={open}
      onClose={onClose}
      title="Nova Aplicação"
      icon={AppWindow}
      footer={
        <>
          <Button variant="outline" size="sm" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button size="sm" className="flex-1" onClick={handleSubmit} disabled={!form.customerId || !form.name}>
            <Rocket className="h-4 w-4 mr-1.5" />
            Criar Aplicação
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Cliente *</Label>
          <Select value={form.customerId} onValueChange={v => setForm({...form, customerId: v})}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
            <SelectContent>
              {customers.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name} — {c.company || 'Sem empresa'}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Nome da Aplicação *</Label>
          <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex: Farmácia Gestão Pro" className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Descrição</Label>
          <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Breve descrição da aplicação" rows={2} className="text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Nicho</Label>
            <Input value={form.niche} onChange={e => setForm({...form, niche: e.target.value})} placeholder="Farmácia, Varejo..." className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Complexidade</Label>
            <Select value={form.complexity} onValueChange={v => setForm({...form, complexity: v})}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Objetivo</Label>
          <Input value={form.objective} onChange={e => setForm({...form, objective: e.target.value})} placeholder="Ex: Substituir planilhas por sistema digital" className="h-9 text-sm" />
        </div>
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
          <p className="text-xs text-amber-700">
            ⚠️ Regra de Negócio: Nenhuma aplicação será iniciada sem pagamento confirmado (Doc 29, Seção 18).
          </p>
        </div>
      </div>
    </ModalBase>
  )
}

// =====================================================
// CREATE LICENSE MODAL
// =====================================================

export function CreateLicenseModal({ open, onClose, onSubmit, customers }: {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  customers: Array<{ id: string; name: string }>
}) {
  const [form, setForm] = useState({
    customerId: '', plan: 'professional', duration: 365, maxUsers: 50,
    maxApps: 5, storageMb: 5000, price: 18000, autoRenew: true,
  })

  const planConfig: Record<string, { maxUsers: number; maxApps: number; storageMb: number; price: number }> = {
    starter: { maxUsers: 10, maxApps: 1, storageMb: 500, price: 4800 },
    professional: { maxUsers: 50, maxApps: 5, storageMb: 5000, price: 18000 },
    enterprise: { maxUsers: 200, maxApps: 20, storageMb: 20000, price: 60000 },
    trial: { maxUsers: 5, maxApps: 1, storageMb: 500, price: 0 },
  }

  const handlePlanChange = (plan: string) => {
    const cfg = planConfig[plan]
    setForm({ ...form, plan, ...cfg, autoRenew: plan !== 'trial' })
  }

  const handleSubmit = () => {
    if (!form.customerId) return
    onSubmit(form)
  }

  return (
    <ModalBase
      open={open}
      onClose={onClose}
      title="Gerar Licença"
      icon={Key}
      footer={
        <>
          <Button variant="outline" size="sm" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button size="sm" className="flex-1" onClick={handleSubmit} disabled={!form.customerId}>
            <Key className="h-4 w-4 mr-1.5" />
            Gerar Licença
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Cliente *</Label>
          <Select value={form.customerId} onValueChange={v => setForm({...form, customerId: v})}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
            <SelectContent>
              {customers.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Plano</Label>
          <div className="grid grid-cols-4 gap-2">
            {['starter', 'professional', 'enterprise', 'trial'].map(plan => (
              <button
                key={plan}
                onClick={() => handlePlanChange(plan)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all capitalize ${
                  form.plan === plan ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {plan}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Duração (dias)</Label>
            <Input type="number" value={form.duration} onChange={e => setForm({...form, duration: parseInt(e.target.value)})} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Máx. Usuários</Label>
            <Input type="number" value={form.maxUsers} onChange={e => setForm({...form, maxUsers: parseInt(e.target.value)})} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Máx. Apps</Label>
            <Input type="number" value={form.maxApps} onChange={e => setForm({...form, maxApps: parseInt(e.target.value)})} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Storage (MB)</Label>
            <Input type="number" value={form.storageMb} onChange={e => setForm({...form, storageMb: parseInt(e.target.value)})} className="h-9 text-sm" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Valor (R$)</Label>
          <Input type="number" value={form.price} onChange={e => setForm({...form, price: parseFloat(e.target.value)})} className="h-9 text-sm" />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
          <div>
            <Label className="text-xs">Auto-renovação</Label>
            <p className="text-[10px] text-slate-500">Renova automaticamente ao expirar</p>
          </div>
          <input type="checkbox" checked={form.autoRenew} onChange={e => setForm({...form, autoRenew: e.target.checked})} className="h-4 w-4" />
        </div>

        <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
          <p className="text-xs text-blue-700">
            ℹ️ A license key será gerada automaticamente no formato: ORN-XXX-2026-XXXX-XXXX-XXXX
          </p>
        </div>
      </div>
    </ModalBase>
  )
}

// =====================================================
// FLOW VISUALIZER (Fluxos Oficiais - Doc 29, Seção 17)
// =====================================================

const COMMERCIAL_FLOW = [
  'Landing Page', 'Plano', 'Stripe', 'Pagamento', 'Conta',
  'Projeto', 'Desenvolvimento', 'Entrega', 'Dashboard', 'Atualizações',
]

const TECHNICAL_FLOW = [
  'Cliente', 'Cadastro', 'Projeto', 'Fila', 'IA',
  'Desenvolvimento', 'Testes', 'Build', 'Publicação', 'Licenciamento', 'Entrega',
]

export function FlowVisualizer({ type }: { type: 'commercial' | 'technical' }) {
  const flow = type === 'commercial' ? COMMERCIAL_FLOW : TECHNICAL_FLOW
  const color = type === 'commercial' ? 'bg-blue-500' : 'bg-purple-500'

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5">
        {flow.map((step, index) => (
          <div key={step} className="flex items-center gap-1.5">
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium ${color} text-white`}>
              <span className="opacity-60">{index + 1}</span>
              {step}
            </div>
            {index < flow.length - 1 && (
              <svg width="12" height="12" viewBox="0 0 12 12" className="text-slate-300">
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
