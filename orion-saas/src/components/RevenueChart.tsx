import { TrendingUp } from 'lucide-react'

// Mock data: 12 months of revenue (in R$ thousands)
const REVENUE_DATA = [
  { month: 'Jun', value: 142 },
  { month: 'Jul', value: 168 },
  { month: 'Ago', value: 155 },
  { month: 'Set', value: 189 },
  { month: 'Out', value: 205 },
  { month: 'Nov', value: 198 },
  { month: 'Dez', value: 224 },
  { month: 'Jan', value: 218 },
  { month: 'Fev', value: 241 },
  { month: 'Mar', value: 235 },
  { month: 'Abr', value: 262 },
  { month: 'Mai', value: 286.58 },
]

export function RevenueChart() {
  const max = Math.max(...REVENUE_DATA.map((d) => d.value))
  const min = 0
  const width = 600
  const height = 200
  const padding = { top: 20, right: 20, bottom: 30, left: 50 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const points = REVENUE_DATA.map((d, i) => {
    const x = padding.left + (i / (REVENUE_DATA.length - 1)) * chartWidth
    const y = padding.top + chartHeight - ((d.value - min) / (max - min)) * chartHeight
    return { x, y, ...d }
  })

  // Smooth curve using cubic bezier
  const pathD = points
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`
      const prev = points[i - 1]
      const cpx1 = prev.x + (p.x - prev.x) / 2
      const cpx2 = prev.x + (p.x - prev.x) / 2
      return `C ${cpx1} ${prev.y}, ${cpx2} ${p.y}, ${p.x} ${p.y}`
    })
    .join(' ')

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`

  // Y-axis ticks
  const yTicks = [0, 100, 200, 300, 400]

  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Receita nos Últimos 12 Meses</h3>
          <p className="text-tiny mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Evolução do MRR ao longo do tempo
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-white">R$ 286.580,00</p>
          <p className="text-tiny font-semibold flex items-center gap-0.5 justify-end" style={{ color: '#34d399' }}>
            <TrendingUp className="w-3 h-3" />
            +18,6%
          </p>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="revenue-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yTicks.map((tick) => {
          const y = padding.top + chartHeight - (tick / 400) * chartHeight
          return (
            <g key={tick}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="1"
              />
              <text
                x={padding.left - 8}
                y={y + 3}
                textAnchor="end"
                fill="#6b7280"
                fontSize="10"
              >
                R$ {tick}k
              </text>
            </g>
          )
        })}

        {/* Area */}
        <path d={areaD} fill="url(#revenue-gradient)" />

        {/* Line */}
        <path d={pathD} fill="none" stroke="url(#line-gradient)" strokeWidth="2.5" strokeLinecap="round" />

        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3" fill="#0a0b14" stroke="#a855f7" strokeWidth="2" />
            <text
              x={p.x}
              y={height - 10}
              textAnchor="middle"
              fill="#6b7280"
              fontSize="10"
            >
              {p.month}
            </text>
          </g>
        ))}

        {/* Highlight last point */}
        <g>
          <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="5" fill="#a855f7" />
          <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="9" fill="#a855f7" fillOpacity="0.2" />
        </g>
      </svg>
    </div>
  )
}
