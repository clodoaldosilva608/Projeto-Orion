import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { KpiGrid } from '@/components/KpiGrid'
import { RevenueChart } from '@/components/RevenueChart'
import { ProjectsDonut } from '@/components/ProjectsDonut'
import { SystemStatus } from '@/components/SystemStatus'
import { RecentProjects } from '@/components/RecentProjects'
import { ActivityFeed } from '@/components/ActivityFeed'
import { AlertsPanel } from '@/components/AlertsPanel'
import { AIUsageChart } from '@/components/AIUsageChart'
import { AppDistribution } from '@/components/AppDistribution'
import { ResourceUsage } from '@/components/ResourceUsage'
import { Plus, Calendar } from 'lucide-react'

export default function HomePage() {
  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {/* Hero */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Visão Geral da Plataforma <span className="inline-block">🫡</span>
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Acompanhe o desempenho geral e a gestão de toda a plataforma Orion.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="btn-ghost">
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">{today}</span>
                </button>
                <button className="btn-primary">
                  <Plus className="w-4 h-4" />
                  Novo Projeto
                </button>
              </div>
            </div>

            {/* KPI Grid */}
            <KpiGrid />

            {/* Row 2: Revenue + Donut + System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <RevenueChart />
              <ProjectsDonut />
              <SystemStatus />
            </div>

            {/* Row 3: Recent Projects + Activity + Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <RecentProjects />
              <ActivityFeed />
              <AlertsPanel />
            </div>

            {/* Row 4: AI Usage + App Distribution + Resource Usage */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <AIUsageChart />
              <AppDistribution />
              <ResourceUsage />
            </div>

            {/* Footer */}
            <div
              className="text-center text-tiny py-4"
              style={{ color: 'var(--text-muted)' }}
            >
              Orion Platform · A Fábrica Inteligente de Software · v1.0.0
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
