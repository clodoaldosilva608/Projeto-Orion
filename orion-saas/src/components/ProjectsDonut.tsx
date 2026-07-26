interface Segment {
  label: string
  value: number
  percent: number
  color: string
}

const SEGMENTS: Segment[] = [
  { label: 'Planejamento', value: 48, percent: 14, color: '#3b82f6' },
  { label: 'Em Desenvolvimento', value: 56, percent: 16, color: '#60a5fa' },
  { label: 'Em Testes', value: 68, percent: 20, color: '#fbbf24' },
  { label: 'Homologação', value: 34, percent: 10, color: '#fb923c' },
  { label: 'Aguardando Cliente', value: 41, percent: 12, color: '#f87171' },
  { label: 'Concluídos', value: 95, percent: 28, color: '#10b981' },
]

export function ProjectsDonut() {
  const total = SEGMENTS.reduce((acc, s) => acc + s.value, 0)
  const radius = 70
  const strokeWidth = 18
  const circumference = 2 * Math.PI * radius

  let offset = 0
  const arcs = SEGMENTS.map((seg) => {
    const dash = (seg.percent / 100) * circumference
    const arc = {
      ...seg,
      dash,
      gap: circumference - dash,
      offset: -offset,
    }
    offset += dash
    return arc
  })

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-white mb-1">Projetos por Status</h3>
      <p className="text-tiny mb-4" style={{ color: 'var(--text-muted)' }}>
        Distribuição atual dos projetos
      </p>

      <div className="flex items-center gap-5">
        {/* Donut SVG */}
        <div className="relative flex-shrink-0">
          <svg width="160" height="160" viewBox="0 0 160 160">
            <g transform="translate(80, 80) rotate(-90)">
              {arcs.map((arc, i) => (
                <circle
                  key={i}
                  r={radius}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${arc.dash} ${arc.gap}`}
                  strokeDashoffset={arc.offset}
                />
              ))}
            </g>
            <text
              x="80"
              y="74"
              textAnchor="middle"
              fill="#f9fafb"
              fontSize="28"
              fontWeight="700"
            >
              {total}
            </text>
            <text
              x="80"
              y="92"
              textAnchor="middle"
              fill="#6b7280"
              fontSize="10"
            >
              Projetos
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-1.5">
          {SEGMENTS.map((seg) => (
            <div key={seg.label} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: seg.color }}
                />
                <span
                  className="truncate"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {seg.label}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-semibold text-white tabular-nums">{seg.value}</span>
                <span
                  className="text-tiny tabular-nums w-8 text-right"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {seg.percent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
