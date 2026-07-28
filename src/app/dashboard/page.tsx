import { redirect } from "next/navigation";
import { checkCompanyLicense } from "@/lib/modules-actions";
import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase";
import { AVAILABLE_MODULES } from "@/lib/modules-catalog";
import { MinimalDashboard } from "@/components/MinimalDashboard";
import { DashboardShell } from "./DashboardShell";
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
import { Plus, CalendarRange } from "lucide-react";

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
          primaryColor: true,
          appName: true,
        },
      },
    },
  });
  return dbUser;
}

export default async function DashboardPage() {
  const dbUser = await getCurrentUserCompany();

  // Não autenticado
  if (!dbUser) redirect("/login");

  // === SUPER ADMIN → dashboard da plataforma (visão global com Sidebar) ===
  if (dbUser.isSuperAdmin) {
    const data = await getDashboardData();
    return (
      <DashboardShell>
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
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg brand-gradient px-4 h-10 text-sm font-semibold text-white shadow-lg">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Novo Projeto</span>
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
      </DashboardShell>
    );
  }

  // === USUÁRIO COMUM (tenant) → DASHBOARD MINIMALISTA (sem Sidebar/Header) ===
  if (!dbUser.companyId) {
    return (
      <div className="min-h-screen bg-[#0a0b14] text-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Bem-vindo!</h1>
          <p className="text-sm text-[#8b8fa3]">Sua conta não está vinculada a uma empresa.</p>
        </div>
      </div>
    );
  }

  // Verifica licença
  const license = await checkCompanyLicense();
  if (!license.active) {
    if (license.status === "trial_expired") redirect("/bloqueada?reason=trial_expired");
    else if (license.status === "suspended") redirect("/bloqueada?reason=suspended");
    else if (license.status === "canceled") redirect("/bloqueada?reason=canceled");
    else if (license.status === "expired") redirect("/bloqueada?reason=expired");
    else redirect("/planos");
  }

  // Onboarding pendente
  if (dbUser.company && !dbUser.company.onboardingCompleted) {
    redirect("/onboarding");
  }

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

  return (
    <MinimalDashboard
      companyId={company.id.toString()}
      companyTradeName={company.tradeName}
      companyInitial={company.tradeName.charAt(0).toUpperCase()}
      primaryColor={company.primaryColor}
      plan={company.plan}
      trialDaysLeft={license.daysLeft}
      trialStatus={license.status}
      stripeCustomerId={company.stripeCustomerId}
      products={products}
    />
  );
}
