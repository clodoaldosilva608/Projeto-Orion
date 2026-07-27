import {
  AlertOctagon,
  AlertTriangle,
  Info,
  type LucideIcon,
} from "lucide-react";

type Severity = "critical" | "warning" | "info";

export type Alert = {
  id: string;
  severity: string;
  title: string;
  description: string;
  createdAt: string;
};

/**
 * Per spec: left border colored by severity (red 3px critical,
 * amber 3px warning, blue 3px info).
 */
const META: Record<
  Severity,
  { icon: LucideIcon; color: string; chipBg: string; label: string }
> = {
  critical: {
    icon: AlertOctagon,
    color: "#ef4444",
    chipBg: "rgba(239, 68, 68, 0.15)",
    label: "Crítico",
  },
  warning: {
    icon: AlertTriangle,
    color: "#f59e0b",
    chipBg: "rgba(245, 158, 11, 0.15)",
    label: "Atenção",
  },
  info: {
    icon: Info,
    color: "#3b82f6",
    chipBg: "rgba(59, 130, 246, 0.15)",
    label: "Informação",
  },
};

function timeAgo(iso: string) {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  return `há ${d} d`;
}

export function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  return (
    <div className="glass-card glass-card-hover p-5 lg:p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-fg">
          Alertas e Notificações
        </h3>
        <span className="text-xs text-muted-2">{alerts.length} ativos</span>
      </div>

      <ul className="space-y-3 flex-1 max-h-96 overflow-y-auto scroll-area pr-1">
        {alerts.map((a) => {
          const sev = (a.severity as Severity) ?? "info";
          const meta = META[sev] ?? META.info;
          const Icon = meta.icon;
          return (
            <li
              key={a.id}
              className="flex gap-3 rounded-lg bg-chip border border-soft p-3"
              style={{ borderLeft: `3px solid ${meta.color}` }}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: meta.chipBg, color: meta.color }}
              >
                <Icon className="h-[18px] w-[18px]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-fg">{a.title}</p>
                  <span
                    className="inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold"
                    style={{ backgroundColor: meta.chipBg, color: meta.color }}
                  >
                    {meta.label}
                  </span>
                </div>
                <p className="text-xs text-muted-fg mt-0.5">{a.description}</p>
                <p className="text-[10px] text-muted-2 mt-1">
                  {timeAgo(a.createdAt)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
