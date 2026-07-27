import { Plus, CalendarRange } from "lucide-react";
import { KpiGrid } from "@/components/KpiGrid";
import { RevenueChart } from "@/components/RevenueChart";
import { ProjectsDonut } from "@/components/ProjectsDonut";
import { SystemStatus } from "@/components/SystemStatus";
import { RecentProjects } from "@/components/RecentProjects";
import { ActivityFeed } from "@/components/ActivityFeed";
import { AlertsPanel } from "@/components/AlertsPanel";
import { AIUsageChart } from "@/components/AIUsageChart";
import { AppDistribution } from "@/components/AppDistribution";
import { ResourceUsage } from "@/components/ResourceUsage";
import { getDashboardData } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-5 lg:space-y-6 max-w-[1600px] mx-auto">
      {/* Hero */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 fade-in-up">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-fg tracking-tight">
            Visão Geral da Plataforma 🫡
          </h1>
          <p className="text-sm text-muted-fg mt-1.5 max-w-2xl">
            Acompanhe o desempenho geral e gerencie toda a plataforma Orion em um único painel.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-soft bg-chip px-3.5 h-10 text-sm font-medium text-fg hover:bg-chip-hover transition-colors">
            <CalendarRange className="h-4 w-4 text-muted-2" />
            <span className="hidden sm:inline">Últimos 30 dias</span>
            <span className="sm:hidden">30 dias</span>
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg brand-gradient px-4 h-10 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-95 transition-opacity">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Projeto</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>
      </div>

      {/* Row 1 — 6 KPI cards (2 / 3 / 6 responsive cols) */}
      <KpiGrid kpis={data.kpis} />

      {/* Row 2 — Revenue, Donut, System Status (1 / 2 / 3 responsive cols) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5 stagger">
        <RevenueChart data={data.revenue} mrr={data.kpis.mrr.value} />
        <ProjectsDonut data={data.projectsByStatus} />
        <SystemStatus services={data.systemServices} />
      </div>

      {/* Row 3 — Recent Projects, Activity, Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5 stagger">
        <RecentProjects projects={data.recentProjects} />
        <ActivityFeed activities={data.activities} />
        <AlertsPanel alerts={data.alerts} />
      </div>

      {/* Row 4 — AI Usage, App Distribution, Resource Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5 stagger">
        <AIUsageChart data={data.aiUsage} />
        <AppDistribution data={data.appDistribution} />
        <ResourceUsage data={data.resources} />
      </div>
    </div>
  );
}
