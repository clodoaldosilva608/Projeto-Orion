'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Target, Send, Calendar, CheckCircle2 } from 'lucide-react'
import { submitResultAction } from '@/modules/results/services/results.actions'

interface Goal {
  id: string
  name: string
  indicator: {
    unit: string | null
  }
}

export default function SubmitResultForm({ goals }: { goals: Goal[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    goalId: '',
    value: '',
    referenceDate: new Date().toISOString().split('T')[0],
    notes: ''
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const result = await submitResultAction({
      goalId: formData.goalId,
      value: parseFloat(formData.value),
      referenceDate: formData.referenceDate,
      notes: formData.notes
    })

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setFormData(prev => ({ ...prev, value: '', notes: '' }))
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    }
    
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-2 pb-2" style={{ borderBottom: '1px solid rgb(var(--glass-border))' }}>
        <Send className="w-4 h-4" style={{ color: 'rgb(var(--orion-emerald))' }} />
        <h3 className="font-semibold text-white">Lançar Resultado</h3>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
          Meta / Campanha *
        </label>
        <select
          required
          value={formData.goalId}
          onChange={e => handleChange('goalId', e.target.value)}
          className="orion-input appearance-none bg-no-repeat"
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23a0a0c8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundPosition: 'right 12px center'
          }}
        >
          <option value="" disabled>Selecione a meta...</option>
          {goals.map(goal => (
            <option key={goal.id} value={goal.id}>{goal.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
            Valor Alcançado *
          </label>
          <input
            type="number"
            step="0.01"
            required
            value={formData.value}
            onChange={e => handleChange('value', e.target.value)}
            placeholder="Ex: 150.50"
            className="orion-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 flex items-center gap-1" style={{ color: 'rgb(var(--text-secondary))' }}>
            <Calendar className="w-3 h-3" /> Data Referência *
          </label>
          <input
            type="date"
            required
            value={formData.referenceDate}
            onChange={e => handleChange('referenceDate', e.target.value)}
            className="orion-input"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
          Observações
        </label>
        <textarea
          value={formData.notes}
          onChange={e => handleChange('notes', e.target.value)}
          placeholder="Opcional. Ex: Venda do cliente X..."
          className="orion-input resize-y min-h-[80px]"
        />
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3" style={{ background: 'rgb(244 63 94 / 0.1)', border: '1px solid rgb(244 63 94 / 0.3)' }}>
          <p className="text-sm" style={{ color: 'rgb(244 63 94)' }}>{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-xl px-4 py-3 flex items-center gap-2" style={{ background: 'rgb(16 185 129 / 0.1)', border: '1px solid rgb(16 185 129 / 0.3)' }}>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <p className="text-sm text-emerald-400">Resultado lançado! Aguardando aprovação.</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl text-white font-semibold shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg, rgb(16 185 129), rgb(6 182 212))' }}
      >
        {loading ? 'Enviando...' : 'Enviar Resultado'}
      </button>
    </form>
  )
}
