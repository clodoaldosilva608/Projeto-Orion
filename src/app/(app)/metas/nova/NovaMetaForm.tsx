'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Target, Calendar, BarChart2 } from 'lucide-react'
import { createGoalAction } from '@/modules/goals/services/goals.actions'

interface Indicator {
  id: string
  name: string
  unit: string | null
}

export default function NovaMetaForm({ indicators }: { indicators: Indicator[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    indicatorId: '',
    targetValue: '',
    type: 'monthly',
    startDate: '',
    endDate: ''
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await createGoalAction({
      name: formData.name,
      description: formData.description,
      indicatorId: Number(formData.indicatorId),
      targetValue: parseFloat(formData.targetValue),
      type: formData.type as any,
      startDate: formData.startDate,
      endDate: formData.endDate
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/metas')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Detalhes Principais */}
        <div className="glass-card p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2 pb-2" style={{ borderBottom: '1px solid rgb(var(--glass-border))' }}>
            <Target className="w-4 h-4" style={{ color: 'rgb(var(--orion-indigo))' }} />
            <h3 className="font-semibold text-white">Detalhes da Meta</h3>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
              Nome da Meta *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="Ex: Recorde de Vendas Julho"
              className="orion-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
              Descrição (Opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="Objetivo principal desta meta..."
              className="orion-input min-h-[100px] resize-y"
            />
          </div>
        </div>

        {/* Métricas e Prazos */}
        <div className="glass-card p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2 pb-2" style={{ borderBottom: '1px solid rgb(var(--glass-border))' }}>
            <BarChart2 className="w-4 h-4" style={{ color: 'rgb(var(--orion-purple))' }} />
            <h3 className="font-semibold text-white">Métrica e Prazo</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
                Indicador *
              </label>
              <select
                required
                value={formData.indicatorId}
                onChange={e => handleChange('indicatorId', e.target.value)}
                className="orion-input appearance-none bg-no-repeat"
                style={{ 
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23a0a0c8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 12px center'
                }}
              >
                <option value="" disabled>Selecione...</option>
                {indicators.map(ind => (
                  <option key={ind.id} value={ind.id}>{ind.name} {ind.unit ? `(${ind.unit})` : ''}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
                Valor Alvo *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.targetValue}
                onChange={e => handleChange('targetValue', e.target.value)}
                placeholder="Ex: 50000"
                className="orion-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
              Tipo de Meta
            </label>
            <select
              value={formData.type}
              onChange={e => handleChange('type', e.target.value)}
              className="orion-input appearance-none bg-no-repeat"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23a0a0c8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundPosition: 'right 12px center'
              }}
            >
              <option value="daily">Diária</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
              <option value="quarterly">Trimestral</option>
              <option value="yearly">Anual</option>
              <option value="custom">Personalizada</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                <Calendar className="w-3 h-3" /> Data Início *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={e => handleChange('startDate', e.target.value)}
                className="orion-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                <Calendar className="w-3 h-3" /> Data Fim *
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={e => handleChange('endDate', e.target.value)}
                className="orion-input"
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3" style={{ background: 'rgb(244 63 94 / 0.1)', border: '1px solid rgb(244 63 94 / 0.3)' }}>
          <p className="text-sm" style={{ color: 'rgb(244 63 94)' }}>{error}</p>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'rgb(var(--glass-border))' }}>
        <Link 
          href="/metas"
          className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          style={{ color: 'rgb(var(--text-secondary))', border: '1px solid rgb(var(--glass-border))' }}
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="btn-gradient px-8"
        >
          {loading ? 'Salvando...' : 'Salvar Meta'}
        </button>
      </div>
    </form>
  )
}
