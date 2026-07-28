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
import { MyProductsCard } from "@/components/MyProductsCard";
import { TenantKpiGrid } from "@/components/TenantKpiGrid";
import { getDashboardData, getDashboardDataTenant } from "@/lib/queries";
import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase";
import { AVAILABLE_MODULES } from "@/lib/modules-catalog";

export const dynamic = "force-dynamic";

async function getCurrentUserCompany() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: {
      id: true,
      isSuperAdmin: true,
      companyId: true,
      name: true,
      company: {
        select: {
          id: true,
          tradeName: true,
          plan: true,
          stripeCustomerId: true,
          active: true,
          onboardingCompleted: true,
        },
      },
    },
  });
  return dbUser;
}

export default async function DashboardPage() {
  const dbUser = await getCurrentUserCompany();

  // Super Admin → dashboard da plataforma (visão global)
  if (dbUser?.isSuperAdmin) {
    const data = await getDashboardData();
    return (
      <div className="space-y-5 lg:space-y-6 max-w-[1600px] mx-auto">
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

        <KpiGrid kpis={data.kpis} />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5 stagger">
          <RevenueChart data={data.revenue} mrr={data.kpis.mrr.value} />
          <ProjectsDonut data={data.projectsByStatus} />
          <SystemStatus services={data.systemServices} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5 stagger">
          <RecentProjects projects={data.recentProjects} />
          <ActivityFeed activities={data.activities} />
          <AlertsPanel alerts={data.alerts} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5 stagger">
          <AIUsageChart data={data.aiUsage} />
          <AppDistribution data={data.appDistribution} />
          <ResourceUsage data={data.resources} />
        </div>
      </div>
    );
  }

  // Usuário comum (tenant) → dashboard da EMPRESA dele
  if (!dbUser?.companyId) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Bem-vindo!</h1>
        <p className="text-sm text-[#8b8fa3]">Sua conta não está vinculada a uma empresa. Entre em contato com o suporte.</p>
      </div>
    );
  }

  // Buscar dados filtrados por companyId
  const data = await getDashboardDataTenant(dbUser.companyId);

  // Buscar módulos habilitados
  const enabledModules = await prisma.enabledModule.findMany({
    where: { companyId: dbUser.companyId },
    select: { moduleKey: true, enabled: true },
  });
  const enabledModulesMap = enabledModules.reduce((acc, m) => {
    acc[m.moduleKey] = m.enabled;
    return acc;
  }, {} as Record<string, boolean>);

  const products = AVAILABLE_MODULES.map((m) => ({
    moduleKey: m.key,
    moduleName: m.name,
    moduleDescription: m.description,
    moduleIcon: m.icon,
    moduleColor: m.color,
    deployUrl: m.deployUrl,
    enabled: enabledModulesMap[m.key] ?? false,
  }));

  const company = dbUser.company;
  const isTrial = data.company?.trialStatus === "trial";
  const trialDaysLeft = data.company?.trialDaysLeft ?? 0;

  return (
    <div className="space-y-5 lg:space-y-6 max-w-[1600px] mx-auto">
      {/* Hero — boas-vindas personalizadas */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 fade-in-up">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-fg tracking-tight">
            Bem-vindo, {company?.tradeName || dbUser.name}! 👋
          </h1>
          <p className="text-sm text-muted-fg mt-1.5 max-w-2xl">
            Gerencie sua empresa e acesse seus produtos em um único painel.
            {isTrial && trialDaysLeft > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 text-[11px] font-semibold">
                Trial: {trialDaysLeft} dias restantes
              </span>
            )}
            {data.company?.trialStatus === "active" && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 text-[11px] font-semibold">
                Plano {company?.plan}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Meus Produtos — card com produtos assinados */}
      {company && (
        <MyProductsCard
          companyId={company.id.toString()}
          companyTradeName={company.tradeName}
          plan={company.plan}
          stripeCustomerId={company.stripeCustomerId}
          products={products}
        />
      )}

      {/* KPIs da empresa */}
      <TenantKpiGrid kpis={data.kpis} />

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5 stagger">
        <RevenueChart data={data.revenue} mrr={data.kpis.results?.value ?? 0} />
        <ProjectsDonut data={data.projectsByStatus} />
        <SystemStatus services={data.systemServices} />
      </div>

      {/* Activity + Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5 stagger">
        <RecentProjects projects={data.recentProjects} />
        <ActivityFeed activities={data.activities} />
        <AlertsPanel alerts={data.alerts} />
      </div>

      {/* Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5 stagger">
        <AIUsageChart data={data.aiUsage} />
        <AppDistribution data={data.appDistribution} />
        <ResourceUsage data={data.resources} />
      </div>
    </div>
  );
}
