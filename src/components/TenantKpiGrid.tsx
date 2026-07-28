import {
  Users,
  Building2,
  Target,
  TrendingUp,
  CheckCircle2,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export type TenantKpi = {
  value: number;
  change: string;
};

export type TenantKpis = {
  users?: TenantKpi;
  branches?: TenantKpi;
  indicators?: TenantKpi;
  goals?: TenantKpi;
  goalsAchieved?: TenantKpi;
  results?: TenantKpi;
};

const KPI_CONFIG: { key: keyof TenantKpis; label: string; icon: LucideIcon; color: string }[] = [
  { key: "users", label: "Usuários", icon: Users, color: "#3b82f6" },
  { key: "branches", label: "Filiais", icon: Building2, color: "#10b981" },
  { key: "indicators", label: "Indicadores", icon: BarChart3, color: "#f59e0b" },
  { key: "goals", label: "Metas", icon: Target, color: "#ec4899" },
  { key: "goalsAchieved", label: "Metas Atingidas", icon: CheckCircle2, color: "#10b981" },
  { key: "results", label: "Resultados (30d)", icon: TrendingUp, color: "#8b5cf6" },
];

export function TenantKpiGrid({ kpis }: { kpis: TenantKpis }) {
  const activeKpis = KPI_CONFIG.filter(k => kpis[k.key]);
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4 stagger">
      {activeKpis.map(({ key, label, icon: Icon, color }) => {
        const k = kpis[key]!;
        return (
          <div key={key} className="glass-card p-4 fade-in-up">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}22` }}>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <span className="text-[10px] uppercase tracking-wide font-semibold text-[#8b8fa3]">{label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{k.value}</div>
            <div className="text-[10px] text-[#6b7280] mt-0.5">{k.change}</div>
          </div>
        );
      })}
    </div>
  );
}
