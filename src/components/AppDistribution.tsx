import {
  Globe,
  Smartphone,
  AppWindow,
  Monitor,
  type LucideIcon,
} from "lucide-react";

export type AppDistItem = {
  label: string;
  count: number;
  percent: number;
};

type AppMeta = {
  icon: LucideIcon;
  short: string;
  bg: string;
  fg: string;
};

const APP_META: Record<string, AppMeta> = {
  "Web Apps": {
    icon: Globe,
    short: "Web",
    bg: "rgba(139, 92, 246, 0.15)",
    fg: "#a78bfa",
  },
  "Mobile Apps": {
    icon: Smartphone,
    short: "Mobile",
    bg: "rgba(14, 165, 233, 0.15)",
    fg: "#38bdf8",
  },
  PWA: {
    icon: AppWindow,
    short: "PWA",
    bg: "rgba(236, 72, 153, 0.15)",
    fg: "#f472b6",
  },
  "Desktop Apps": {
    icon: Monitor,
    short: "Desktop",
    bg: "rgba(16, 185, 129, 0.15)",
    fg: "#34d399",
  },
};

export function AppDistribution({ data }: { data: AppDistItem[] }) {
  const total = data.reduce((acc, d) => acc + d.count, 0);

  return (
    <div className="glass-card glass-card-hover p-5 lg:p-6 flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-fg">
          Distribuição de Aplicações
        </h3>
        <p className="text-xs text-muted-2 mt-0.5">
          {total} aplicações publicadas
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 flex-1">
        {data.map((a) => {
          const meta =
            APP_META[a.label] ?? {
              icon: AppWindow,
              short: a.label,
              bg: "rgba(139, 92, 246, 0.15)",
              fg: "#a78bfa",
            };
          const Icon = meta.icon;
          return (
            <div
              key={a.label}
              className="rounded-xl bg-chip border border-soft p-4 flex flex-col gap-3"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: meta.bg, color: meta.fg }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-fg">{a.count}</p>
                <p className="text-xs text-muted-fg">{meta.short}</p>
              </div>
              <div className="mt-auto">
                <div className="flex items-center justify-between text-[11px] text-muted-2 mb-1">
                  <span>{a.percent}%</span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "var(--chip-bg)" }}
                >
                  <div
                    className="h-full rounded-full brand-gradient"
                    style={{ width: `${a.percent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
