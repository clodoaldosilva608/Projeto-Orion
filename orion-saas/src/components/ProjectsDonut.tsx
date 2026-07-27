export type DonutSegment = {
  label: string;
  value: number;
  percent: number;
  color: string;
};

const R = 70;
const CX = 100;
const CY = 100;
const C = 2 * Math.PI * R;
const GAP = 2;

export function ProjectsDonut({ data }: { data: DonutSegment[] }) {
  let cumulative = 0;
  const total = data.reduce((acc, s) => acc + s.value, 0);

  return (
    <div className="glass-card glass-card-hover p-5 lg:p-6 flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-fg">Projetos por Status</h3>
        <p className="text-xs text-muted-2 mt-0.5">
          Distribuição dos {total} projetos
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-5 flex-1">
        <div className="relative shrink-0">
          <svg viewBox="0 0 200 200" className="w-40 h-40 lg:w-44 lg:h-44">
            <g transform={`rotate(-90 ${CX} ${CY})`}>
              <circle
                cx={CX}
                cy={CY}
                r={R}
                fill="none"
                stroke="var(--grid-line)"
                strokeWidth={22}
              />
              {data.map((seg) => {
                const len = (seg.percent / 100) * C - GAP;
                const offset = -cumulative;
                cumulative += (seg.percent / 100) * C;
                return (
                  <circle
                    key={seg.label}
                    cx={CX}
                    cy={CY}
                    r={R}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={22}
                    strokeLinecap="round"
                    strokeDasharray={`${len} ${C - len}`}
                    strokeDashoffset={offset}
                  />
                );
              })}
            </g>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-fg">{total}</span>
            <span className="text-[11px] text-muted-2">projetos</span>
          </div>
        </div>

        <ul className="flex-1 w-full space-y-2.5">
          {data.map((seg) => (
            <li key={seg.label} className="flex items-center gap-3 text-sm">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span className="flex-1 text-muted-fg truncate">{seg.label}</span>
              <span className="font-semibold text-fg">{seg.value}</span>
              <span className="text-muted-2 text-xs w-9 text-right">
                {seg.percent}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
