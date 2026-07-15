import type { Metadata } from 'next'
import { createClient } from '@/shared/lib/supabase-server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Dashboard | Orion',
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950">
      {children}
    </div>
  )
}
