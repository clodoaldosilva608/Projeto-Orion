export type AiUsagePoint = { day: string; value: number };

/**
 * AI Usage Chart — bar chart with the gradient spec:
 *  - Last bar:  linear-gradient(180deg, #a855f7, #ec4899)
 *  - Other bars: lighter version (lower opacity)
 */
export function AIUsageChart({ data }: { data: AiUsagePoint[] }) {
  const max = data.length ? Math.max(...data.map((d) => d.value)) : 1;
  const total = data.reduce((acc, d) => acc + d.value, 0);
  const totalK = (total / 1000).toFixed(1).replace(".", ",");

  // gradients (per spec)
  const lastBarGradient = "linear-gradient(180deg, #a855f7 0%, #ec4899 100%)";
  const barGradient =
    "linear-gradient(180deg, rgba(168, 85, 247, 0.55) 0%, rgba(236, 72, 153, 0.45) 100%)";

  return (
    <div className="glass-card glass-card-hover p-5 lg:p-6 flex flex-col h-full">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-fg">Uso de IA por Período</h3>
          <p className="text-xs text-muted-2 mt-0.5">
            Últimos 14 dias (tokens em milhares)
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-fg">{totalK}k</p>
          <p className="text-[11px] text-muted-2">tokens totais</p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-1.5 flex-1 min-h-[160px]">
        {data.map((d, i) => {
          const h = max > 0 ? (d.value / max) * 100 : 0;
          const isLast = i === data.length - 1;
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-2 group"
              title={`${d.day}: ${d.value.toLocaleString("pt-BR")} tokens`}
            >
              <div className="relative w-full h-full flex items-end">
                <div
                  className="w-full rounded-t-md transition-all duration-300 group-hover:opacity-90"
                  style={{
                    height: `${h}%`,
                    background: isLast ? lastBarGradient : barGradient,
                    minHeight: h > 0 ? "4px" : "0",
                  }}
                />
              </div>
              <span className="text-[9px] text-muted-2">{d.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
