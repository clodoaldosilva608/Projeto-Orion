'use client'

import { deleteCampaignAction } from '@/modules/campaigns/services/campaigns.actions'
import { Trash2 } from 'lucide-react'
import { useTransition } from 'react'

export function DeleteCampaignButton({ campaignId }: { campaignId: string }) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!confirm('Tem certeza que deseja excluir esta campanha?')) return

    startTransition(async () => {
      await deleteCampaignAction(campaignId)
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-50"
      title="Excluir campanha"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
