import { aiEnabled } from '@/modules/ai/lib/ai-client'
import { getDailyInsightAction } from '@/modules/ai/services/ai.actions'
import IaClient from './IaClient'

export const metadata = {
  title: 'Orion — Assistente de IA',
}

export default async function IaPage() {
  // Insight diário inicial (usa fallback estático se a IA estiver desligada)
  const { insight } = await getDailyInsightAction()

  return <IaClient aiEnabled={aiEnabled} initialInsight={insight ?? ''} />
}
