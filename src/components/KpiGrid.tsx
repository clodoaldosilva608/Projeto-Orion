import {
  Users,
  FolderKanban,
  AppWindow,
  KeyRound,
  DollarSign,
  Cpu,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type KpiValue = {
  value: number;
  change: string;
};

export type Kpis = {
  clients: KpiValue;
  projects: KpiValue;
  applications: KpiValue;
  licenses: KpiValue;
  mrr: KpiValue;
  aiUsage: KpiValue;
};

type Kpi = {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
  accent: string;
};

function formatInt(n: number) {
  return n.toLocaleString("pt-BR");
}

function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function KpiGrid({ kpis }: { kpis: Kpis }) {
  const cards: Kpi[] = [
    {
      label: "Clientes",
      value: formatInt(kpis.clients.value),
      change: kpis.clients.change,
      icon: Users,
      accent: "from-violet-500/20 to-violet-500/5 text-violet-300",
    },
    {
      label: "Projetos Ativos",
      value: formatInt(kpis.projects.value),
      change: kpis.projects.change,
      icon: FolderKanban,
      accent: "from-indigo-500/20 to-indigo-500/5 text-indigo-300",
    },
    {
      label: "Aplicações Publicadas",
      value: formatInt(kpis.applications.value),
      change: kpis.applications.change,
      icon: AppWindow,
      accent: "from-fuchsia-500/20 to-fuchsia-500/5 text-fuchsia-300",
    },
    {
      label: "Licenças Ativas",
      value: formatInt(kpis.licenses.value),
      change: kpis.licenses.change,
      icon: KeyRound,
      accent: "from-emerald-500/20 to-emerald-500/5 text-emerald-300",
    },
    {
      label: "Receita Mensal (MRR)",
      value: formatBRL(kpis.mrr.value),
      change: kpis.mrr.change,
      icon: DollarSign,
      accent: "from-amber-500/20 to-amber-500/5 text-amber-300",
    },
    {
      label: "Uso de IA Líder",
      value: formatInt(kpis.aiUsage.value),
      change: kpis.aiUsage.change,
      icon: Cpu,
      accent: "from-sky-500/20 to-sky-500/5 text-sky-300",
    },
  ];

  // Responsive: 2 cols mobile, 3 cols tablet (md), 6 cols desktop (xl)
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-5 stagger">
      {cards.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.label}
            className="glass-card glass-card-hover p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div
                className={cn(
                  "flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-br",
                  kpi.accent,
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: "rgba(16, 185, 129, 0.10)",
                  color: "#10b981",
                }}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                {kpi.change}
              </span>
            </div>
            <div>
              <p
                className="font-bold text-fg tracking-tight leading-tight"
                style={{ fontSize: "clamp(1.25rem, 2.2vw, 1.875rem)" }}
              >
                {kpi.value}
              </p>
              <p className="mt-1 text-xs sm:text-sm text-muted-fg">{kpi.label}</p>
              <p className="mt-1.5 sm:mt-2 text-[11px] text-muted-2">
                vs mês anterior
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
