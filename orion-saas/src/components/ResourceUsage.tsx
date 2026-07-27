import { Cpu, MemoryStick, HardDrive, Database, type LucideIcon } from "lucide-react";

export type Resource = {
  label: string;
  percent: number;
  status: "ok" | "warning" | "critical";
};

const ICON_BY_LABEL: Record<string, LucideIcon> = {
  CPU: Cpu,
  Memória: MemoryStick,
  Storage: HardDrive,
  "Banco de Dados": Database,
};

/**
 * Per spec: resource bars use linear-gradient(90deg, color99, color)
 * with semantic colors. We construct an rgba "lighter" 60%-opacity stop
 * (representing "color99") -> full color stop.
 */
const STATUS: Record<
  Resource["status"],
  { color: string; colorSoft: string; text: string; label: string }
> = {
  ok: {
    color: "#10b981",
    colorSoft: "rgba(16, 185, 129, 0.35)",
    text: "#10b981",
    label: "Saudável",
  },
  warning: {
    color: "#f59e0b",
    colorSoft: "rgba(245, 158, 11, 0.35)",
    text: "#f59e0b",
    label: "Atenção",
  },
  critical: {
    color: "#ef4444",
    colorSoft: "rgba(239, 68, 68, 0.35)",
    text: "#ef4444",
    label: "Crítico",
  },
};

export function ResourceUsage({ data }: { data: Resource[] }) {
  return (
    <div className="glass-card glass-card-hover p-5 lg:p-6 flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-fg">Consumo de Recursos</h3>
        <p className="text-xs text-muted-2 mt-0.5">
          Infraestrutura em tempo real — Hoje
        </p>
      </div>

      <ul className="space-y-4 flex-1">
        {data.map((r) => {
          const Icon = ICON_BY_LABEL[r.label] ?? Cpu;
          const meta = STATUS[r.status] ?? STATUS.ok;
          return (
            <li key={r.label}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chip text-muted-fg">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-fg">
                    {r.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-medium"
                    style={{ color: meta.text }}
                  >
                    {meta.label}
                  </span>
                  <span className="text-sm font-bold text-fg w-10 text-right">
                    {r.percent}%
                  </span>
                </div>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: "var(--chip-bg)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${r.percent}%`,
                    background: `linear-gradient(90deg, ${meta.colorSoft}, ${meta.color})`,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
