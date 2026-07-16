'use client'

import { createCampaignAction } from '@/modules/campaigns/services/campaigns.actions'
import { SubmitButton } from './SubmitButton'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function NovaCampanhaForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    const result = await createCampaignAction(formData)
    
    if (result.error) {
      setError(result.error)
    } else {
      router.push('/campanhas')
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl text-sm bg-rose-500/10 text-rose-500 border border-rose-500/30">
          {error}
        </div>
      )}
      
      <div className="p-6 rounded-2xl" style={{ background: 'rgb(var(--glass-bg))', border: '1px solid rgb(var(--glass-border))' }}>
        <h2 className="text-lg font-semibold text-white mb-6">Detalhes da Campanha</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>
              Nome da Campanha *
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-4 py-2 rounded-xl text-sm bg-black/20 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500/50"
              style={{ border: '1px solid rgb(var(--glass-border))' }}
              placeholder="Ex: Black Friday 2025"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>
              Descrição
            </label>
            <textarea
              name="description"
              rows={3}
              className="w-full px-4 py-2 rounded-xl text-sm bg-black/20 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500/50"
              style={{ border: '1px solid rgb(var(--glass-border))' }}
              placeholder="Qual o objetivo principal dessa campanha?"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                Data de Início *
              </label>
              <input
                type="date"
                name="startDate"
                required
                className="w-full px-4 py-2 rounded-xl text-sm bg-black/20 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500/50"
                style={{ border: '1px solid rgb(var(--glass-border))' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                Data de Fim *
              </label>
              <input
                type="date"
                name="endDate"
                required
                className="w-full px-4 py-2 rounded-xl text-sm bg-black/20 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500/50"
                style={{ border: '1px solid rgb(var(--glass-border))' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-white/5"
          style={{ color: 'rgb(var(--text-secondary))' }}
        >
          Cancelar
        </button>
        <SubmitButton />
      </div>
    </form>
  )
}
