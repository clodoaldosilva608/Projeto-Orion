export type SystemService = {
  id: string;
  name: string;
  status: string;
  uptime: number;
};

function statusLabel(status: string) {
  switch (status) {
    case "operational":
      return "Operacional";
    case "degraded":
      return "Degradado";
    case "partial_outage":
      return "Parcial";
    case "major_outage":
      return "Indisponível";
    case "maintenance":
      return "Manutenção";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

export function SystemStatus({ services }: { services: SystemService[] }) {
  const allOperational = services.every((s) => s.status === "operational");

  return (
    <div className="glass-card glass-card-hover p-5 lg:p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-fg">Status do Sistema</h3>
          <p className="text-xs text-muted-2 mt-0.5">
            {allOperational
              ? "Todos os serviços operacionais"
              : "Alguns serviços com problemas"}
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
          style={
            allOperational
              ? { backgroundColor: "rgba(16,185,129,0.10)", color: "#10b981" }
              : { backgroundColor: "rgba(245,158,11,0.10)", color: "#f59e0b" }
          }
        >
          <span
            className="h-2 w-2 rounded-full pulse-dot"
            style={{
              backgroundColor: allOperational ? "#10b981" : "#f59e0b",
              color: allOperational ? "#10b981" : "#f59e0b",
            }}
          />
          {allOperational ? "Operacional" : "Atenção"}
        </span>
      </div>

      <ul className="space-y-2 flex-1">
        {services.map((s) => {
          const ok = s.status === "operational";
          const color = ok ? "#10b981" : "#f59e0b";
          return (
            <li
              key={s.id}
              className="flex items-center justify-between rounded-lg bg-chip border border-soft px-3 py-2.5"
            >
              <span className="text-sm text-fg/90">{s.name}</span>
              <span
                className="inline-flex items-center gap-2 text-xs font-medium"
                style={{ color }}
              >
                <span
                  className="h-2 w-2 rounded-full pulse-dot"
                  style={{ backgroundColor: color, color }}
                />
                {statusLabel(s.status)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
