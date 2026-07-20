'use client'

import { ToastProvider } from './orion-hooks'
import { OrionAdminDashboardInner } from './orion-admin-dashboard'
import type { AdminDashboardData } from '@/lib/admin-data'

export function OrionAdminDashboard({ data }: { data: AdminDashboardData }) {
  return (
    <ToastProvider>
      <OrionAdminDashboardInner data={data} />
    </ToastProvider>
  )
}
