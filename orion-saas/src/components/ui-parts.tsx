import { type LucideIcon } from "lucide-react";

export function PageHeader({
  title,
  description,
  icon: Icon,
  action,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 fade-in-up">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300 shrink-0">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-fg tracking-tight">{title}</h1>
          <p className="text-sm mt-1 text-muted-fg">{description}</p>
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function PageButton({
  children,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
}) {
  const cls =
    variant === "primary"
      ? "inline-flex items-center gap-2 rounded-lg brand-gradient px-4 h-10 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-95 transition-opacity"
      : "inline-flex items-center gap-2 rounded-lg border border-soft bg-chip px-4 h-10 text-sm font-medium text-fg hover:bg-chip-hover transition-colors";
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info" | "violet";
}) {
  const tones: Record<string, { bg: string; fg: string }> = {
    neutral: { bg: "var(--chip-bg)", fg: "var(--foreground)" },
    success: { bg: "rgba(16,185,129,0.15)", fg: "#34d399" },
    warning: { bg: "rgba(245,158,11,0.15)", fg: "#fbbf24" },
    danger: { bg: "rgba(239,68,68,0.15)", fg: "#f87171" },
    info: { bg: "rgba(59,130,246,0.15)", fg: "#60a5fa" },
    violet: { bg: "rgba(139,92,246,0.15)", fg: "#a78bfa" },
  };
  const t = tones[tone] ?? tones.neutral;
  return (
    <span
      className="inline-flex rounded-md px-2 py-1 text-[11px] font-semibold"
      style={{ backgroundColor: t.bg, color: t.fg }}
    >
      {children}
    </span>
  );
}

export function Table({
  columns,
  children,
}: {
  columns: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto -mx-2">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-muted-2 border-b border-soft">
            {columns.map((c) => (
              <th key={c} className="font-medium px-2 pb-3">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function StatCard({
  label,
  value,
  change,
  tone = "violet",
}: {
  label: string;
  value: string;
  change?: string;
  tone?: "violet" | "emerald" | "amber" | "sky" | "fuchsia";
}) {
  const tones: Record<string, string> = {
    violet: "from-violet-500/20 to-violet-500/5 text-violet-300",
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-300",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-300",
    sky: "from-sky-500/20 to-sky-500/5 text-sky-300",
    fuchsia: "from-fuchsia-500/20 to-fuchsia-500/5 text-fuchsia-300",
  };
  return (
    <div className="glass-card glass-card-hover p-5">
      <p className="text-sm text-muted-fg">{label}</p>
      <p className="text-2xl font-bold text-fg mt-1">{value}</p>
      {change && (
        <p className="text-xs mt-2 font-medium" style={{ color: "#10b981" }}>
          {change}
        </p>
      )}
    </div>
  );
}
