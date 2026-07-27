import { TrendingUp } from "lucide-react";

export type RevenuePoint = { month: string; value: number };

const W = 600;
const H = 220;
const PAD_X = 24;
const PAD_TOP = 24;
const PAD_BOTTOM = 36;

function buildPoints(values: number[]) {
  if (values.length === 0) return [] as [number, number][];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const lo = min - (max - min) * 0.15 - 1;
  const hi = max + (max - min) * 0.15 + 1;
  const step = values.length > 1 ? (W - PAD_X * 2) / (values.length - 1) : 0;
  return values.map((v, i) => {
    const x = PAD_X + i * step;
    const y = PAD_TOP + (1 - (v - lo) / (hi - lo)) * (H - PAD_TOP - PAD_BOTTOM);
    return [x, y] as [number, number];
  });
}

function smoothPath(pts: [number, number][]) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? 0 : i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
}

function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function RevenueChart({
  data,
  mrr,
}: {
  data: RevenuePoint[];
  mrr: number;
}) {
  const values = data.map((d) => d.value);
  const points = buildPoints(values);
  const linePath = smoothPath(points);
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1][0].toFixed(2)} ${H - PAD_BOTTOM} L ${points[0][0].toFixed(2)} ${H - PAD_BOTTOM} Z`
      : "";

  return (
    <div className="glass-card glass-card-hover p-5 lg:p-6 flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-fg">
            Receita nos Últimos 12 Meses
          </h3>
          <p className="text-xs text-muted-2 mt-0.5">MRR acumulado por mês</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-fg">{formatBRL(mrr)}</p>
          <span
            className="inline-flex items-center gap-1 text-xs font-semibold"
            style={{ color: "#10b981" }}
          >
            <TrendingUp className="h-3.5 w-3.5" /> +18,6%
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Area gradient: #8b5cf6 0.4 opacity → transparent */}
            <linearGradient id="revArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="revLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>

          {/* gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <line
              key={t}
              x1={PAD_X}
              x2={W - PAD_X}
              y1={PAD_TOP + t * (H - PAD_TOP - PAD_BOTTOM)}
              y2={PAD_TOP + t * (H - PAD_TOP - PAD_BOTTOM)}
              stroke="var(--grid-line)"
              strokeWidth={1}
            />
          ))}

          {areaPath && <path d={areaPath} fill="url(#revArea)" />}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="url(#revLine)"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          )}

          {points.map(([x, y], i) => (
            <g key={i}>
              {i === points.length - 1 && (
                <>
                  <circle cx={x} cy={y} r={7} fill="#a78bfa" opacity={0.25} />
                  <circle cx={x} cy={y} r={4.5} fill="#a78bfa" />
                </>
              )}
              {i !== points.length - 1 && (
                <circle
                  cx={x}
                  cy={y}
                  r={2.5}
                  fill="var(--bg)"
                  stroke="#a78bfa"
                  strokeWidth={1.5}
                />
              )}
              <text
                x={x}
                y={H - 12}
                textAnchor="middle"
                fontSize="10"
                fill="var(--muted-2)"
              >
                {data[i]?.month ?? ""}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
