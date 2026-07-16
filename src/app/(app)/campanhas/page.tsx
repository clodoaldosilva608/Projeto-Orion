import { listCampaignsAction } from '@/modules/campaigns/services/campaigns.actions'
import { Plus, Rocket, Users, Target } from 'lucide-react'
import Link from 'next/link'
import { DeleteCampaignButton } from './DeleteCampaignButton'

export default async function CampanhasPage() {
  const { data: campaigns, error } = await listCampaignsAction()

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Campanhas</h1>
          <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
            Gerencie campanhas de incentivo para engajar sua equipe.
          </p>
        </div>
        <Link 
          href="/campanhas/nova"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors hover:opacity-90"
          style={{ background: 'rgb(var(--orion-indigo))' }}
        >
          <Plus className="w-4 h-4" />
          Nova Campanha
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: 'rgb(244 63 94 / 0.1)', border: '1px solid rgb(244 63 94 / 0.3)' }}>
          <p className="text-sm text-rose-500">{error}</p>
        </div>
      )}

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(!campaigns || campaigns.length === 0) ? (
          <div className="col-span-full py-16 text-center rounded-2xl" style={{ background: 'rgb(var(--glass-bg))', border: '1px solid rgb(var(--glass-border))' }}>
            <Rocket className="w-12 h-12 mx-auto mb-4 opacity-50 text-indigo-400" />
            <h3 className="text-lg font-medium text-white mb-1">Nenhuma campanha</h3>
            <p className="text-sm" style={{ color: 'rgb(var(--text-muted))' }}>Você ainda não criou nenhuma campanha de incentivo.</p>
          </div>
        ) : (
          campaigns.map(campaign => {
            const startDate = new Date(campaign.startDate)
            const endDate = new Date(campaign.endDate)
            const isActive = new Date() >= startDate && new Date() <= endDate
            const statusColor = isActive ? 'text-emerald-400 bg-emerald-400/10' : 'text-gray-400 bg-gray-400/10'

            return (
              <div key={campaign.id} className="rounded-2xl flex flex-col" style={{ background: 'rgb(var(--glass-bg))', border: '1px solid rgb(var(--glass-border))' }}>
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-md ${statusColor}`}>
                      {isActive ? 'Ativa' : campaign.status === 'draft' ? 'Rascunho' : 'Inativa'}
                    </span>
                    <DeleteCampaignButton campaignId={campaign.id} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">{campaign.name}</h3>
                  <p className="text-sm line-clamp-2 mb-4" style={{ color: 'rgb(var(--text-secondary))', minHeight: '40px' }}>
                    {campaign.description || 'Sem descrição.'}
                  </p>

                  <div className="flex items-center justify-between text-xs font-medium" style={{ color: 'rgb(var(--text-muted))' }}>
                    <span>Início: {startDate.toLocaleDateString('pt-BR')}</span>
                    <span>Fim: {endDate.toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
                
                <div className="p-4 border-t flex items-center justify-between" style={{ borderColor: 'rgb(var(--glass-border))', background: 'rgb(var(--surface-2))' }}>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-white">
                    <Users className="w-4 h-4 text-indigo-400" />
                    {campaign._count.participants} Participantes
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-white">
                    <Target className="w-4 h-4 text-rose-400" />
                    {campaign._count.goals} Metas
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
