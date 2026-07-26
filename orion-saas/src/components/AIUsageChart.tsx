import { ArrowRight } from 'lucide-react'

// 14 days of AI usage data (in thousands)
const AI_USAGE = [
  { day: '01', value: 12.5 },
  { day: '02', value: 14.8 },
  { day: '03', value: 13.2 },
  { day: '04', value: 16.5 },
  { day: '05', value: 18.2 },
  { day: '06', value: 17.1 },
  { day: '07', value: 19.5 },
  { day: '08', value: 21.3 },
  { day: '09', value: 20.1 },
  { day: '10', value: 22.8 },
  { day: '11', value: 21.5 },
  { day: '12', value: 23.9 },
  { day: '13', value: 24.2 },
  { day: '14', value: 25.1 },
]

export function AIUsageChart() {
  const max = 30
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Uso de IA por Período</h3>
          <p className="text-tiny mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Últimos 14 dias · tokens consumidos (milhares)
          </p>
        </div>
        <a
          href="#"
          className="text-tiny font-medium flex items-center gap-1 transition-colors hover:opacity-80"
          style={{ color: 'var(--brand-primary)' }}
        >
          Ver relatório
          <ArrowRight className="w-3 h-3" />
        </a>
      </div>

      <div className="flex items-end gap-1.5 h-40">
        {AI_USAGE.map((d, i) => {
          const height = (d.value / max) * 100
          const isLast = i === AI_USAGE.length - 1
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1.5 group"
            >
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full rounded-t-md transition-all relative cursor-pointer"
                  style={{
                    height: `${height}%`,
                    background: isLast
                      ? 'linear-gradient(180deg, #a855f7, #ec4899)'
                      : 'linear-gradient(180deg, rgba(139, 92, 246, 0.6), rgba(236, 72, 153, 0.3))',
                    minHeight: '4px',
                  }}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-md" />
                </div>
              </div>
              <span
                className={`text-tiny ${isLast ? 'font-semibold' : ''}`}
                style={{ color: isLast ? '#c4b5fd' : 'var(--text-muted)' }}
              >
                {d.day}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div>
          <p className="text-tiny" style={{ color: 'var(--text-muted)' }}>Total no período</p>
          <p className="text-lg font-bold text-white">271.7k tokens</p>
        </div>
        <div className="text-right">
          <p className="text-tiny" style={{ color: 'var(--text-muted)' }}>Tendência</p>
          <p className="text-sm font-semibold" style={{ color: '#34d399' }}>↑ +18,4%</p>
        </div>
      </div>
    </div>
  )
}
