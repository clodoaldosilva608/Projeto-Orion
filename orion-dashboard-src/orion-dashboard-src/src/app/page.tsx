import { getDashboardData } from '@/lib/orion-data'
import { OrionDashboard } from '@/components/orion/orion-dashboard'

export default async function Home() {
  const data = await getDashboardData()
  return <OrionDashboard data={data} />
}
