import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase-server'
import { Sidebar } from '@/shared/components/Sidebar'
import { Header } from '@/shared/components/Header'

export const metadata: Metadata = {
  title: 'Orion — Dashboard',
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Server-side session check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userData = {
    name: user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'Usuário',
    email: user.email ?? '',
  }

  const companyData = {
    name: user.user_metadata?.company_name ?? 'Minha Empresa',
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'rgb(var(--background))' }}>
      {/* Sidebar */}
      <Sidebar user={userData} company={companyData} />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
