import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getAdminDashboardData } from '@/lib/admin-data'
import { OrionAdminDashboard } from '@/components/orion/orion-admin-wrapper'
import { verifyToken } from '@/lib/auth'

const COOKIE_NAME = 'orion_session'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  const user = token ? verifyToken(token) : null
  if (!user) {
    redirect('/login')
  }
  const data = await getAdminDashboardData()
  return <OrionAdminDashboard data={data} />
}
