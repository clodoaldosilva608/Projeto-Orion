export type RecentProject = {
  id: string;
  name: string;
  client: string;
  status: string;
  progress: number;
  iconColor: string;
  createdAt: string;
};

const STATUS_META: Record<
  string,
  { label: string; chipBg: string; chipFg: string; bar: string }
> = {
  planning: {
    label: "Planejamento",
    chipBg: "rgba(59, 130, 246, 0.15)",
    chipFg: "#60a5fa",
    bar: "#3b82f6",
  },
  in_development: {
    label: "Em Desenvolvimento",
    chipBg: "rgba(139, 92, 246, 0.15)",
    chipFg: "#a78bfa",
    bar: "#8b5cf6",
  },
  in_testing: {
    label: "Em Testes",
    chipBg: "rgba(236, 72, 153, 0.15)",
    chipFg: "#f472b6",
    bar: "#ec4899",
  },
  homologation: {
    label: "Homologação",
    chipBg: "rgba(245, 158, 11, 0.15)",
    chipFg: "#fbbf24",
    bar: "#f59e0b",
  },
  waiting_client: {
    label: "Aguardando Cliente",
    chipBg: "rgba(6, 182, 212, 0.15)",
    chipFg: "#22d3ee",
    bar: "#06b6d4",
  },
  completed: {
    label: "Concluído",
    chipBg: "rgba(16, 185, 129, 0.15)",
    chipFg: "#34d399",
    bar: "#10b981",
  },
  canceled: {
    label: "Cancelado",
    chipBg: "rgba(113, 113, 122, 0.15)",
    chipFg: "#a1a1aa",
    bar: "#71717a",
  },
};

export function RecentProjects({ projects }: { projects: RecentProject[] }) {
  return (
    <div className="glass-card glass-card-hover p-5 lg:p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-fg">Projetos Recentes</h3>
        <button className="text-xs font-medium text-violet-300 hover:text-violet-200">
          Ver todos
        </button>
      </div>

      {/* Tables: horizontal scroll on mobile */}
      <div className="overflow-x-auto -mx-2">
        <table className="w-full min-w-[480px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-muted-2">
              <th className="font-medium px-2 pb-3">Projeto</th>
              <th className="font-medium px-2 pb-3">Status</th>
              <th className="font-medium px-2 pb-3 w-32">Progresso</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const meta = STATUS_META[p.status] ?? STATUS_META.planning;
              return (
                <tr
                  key={p.id}
                  className="group"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <td className="px-2 py-3">
                    <p className="text-sm font-semibold text-fg">{p.name}</p>
                    <p className="text-[11px] text-muted-2">
                      {p.client || "—"}
                    </p>
                  </td>
                  <td className="px-2 py-3">
                    <span
                      className="inline-flex rounded-md px-2 py-1 text-[11px] font-semibold"
                      style={{
                        backgroundColor: meta.chipBg,
                        color: meta.chipFg,
                      }}
                    >
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-1.5 flex-1 rounded-full overflow-hidden"
                        style={{ background: "var(--chip-bg)" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${p.progress}%`,
                            background: `linear-gradient(90deg, ${meta.bar}99, ${meta.bar})`,
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-muted-fg w-8 text-right">
                        {p.progress}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
