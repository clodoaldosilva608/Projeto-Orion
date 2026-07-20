'use client'

/**
 * Componentes de chart para o Orion Dashboard
 * Charts profissionais usando recharts
 */
import {
  Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Cores da paleta enterprise
export const CHART_COLORS = {
  primary: '#0F172A',
  blue: '#3B82F6',
  emerald: '#10B981',
  amber: '#F59E0B',
  red: '#EF4444',
  purple: '#8B5CF6',
  cyan: '#06B6D4',
  slate: '#64748B',
}

export const STATUS_COLORS: Record<string, string> = {
  published: CHART_COLORS.emerald,
  development: CHART_COLORS.blue,
  testing: CHART_COLORS.amber,
  homologation: CHART_COLORS.purple,
  draft: CHART_COLORS.slate,
  archived: '#94A3B8',
  backlog: '#94A3B8',
  updated: CHART_COLORS.emerald,
}

// =====================================================
// Revenue Trend Chart (Area Chart)
// =====================================================

type RevenueChartProps = {
  data: Array<{ month: string; revenue: number }>
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-base font-semibold">Receita Mensal</CardTitle>
          <p className="text-xs text-slate-500 mt-1">Faturamento dos últimos 6 meses</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-slate-900" />
          <span className="text-xs text-slate-600">Receita</span>
        </div>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.15} />
                <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={CHART_COLORS.primary}
              strokeWidth={2.5}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// =====================================================
// App Status Distribution (Pie Chart)
// =====================================================

type AppStatusChartProps = {
  data: Array<{ name: string; value: number; color: string }>
}

export function AppStatusChart({ data }: AppStatusChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Status das Aplicações</CardTitle>
        <p className="text-xs text-slate-500">Distribuição por estado</p>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-900">{total}</p>
              <p className="text-xs text-slate-500">Total</p>
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600">{item.name}</span>
              </div>
              <span className="font-medium text-slate-900">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// =====================================================
// Payment Methods Bar Chart
// =====================================================

type PaymentMethodsChartProps = {
  data: Array<{ method: string; amount: number; label: string }>
}

export function PaymentMethodsChart({ data }: PaymentMethodsChartProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Métodos de Pagamento</CardTitle>
        <p className="text-xs text-slate-500">Distribuição por método</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Total']}
              cursor={{ fill: '#F1F5F9' }}
            />
            <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={50}>
              {data.map((entry, index) => (
                <Cell
                  key={`bar-${index}`}
                  fill={
                    entry.method === 'card' ? CHART_COLORS.blue :
                    entry.method === 'pix' ? CHART_COLORS.emerald :
                    entry.method === 'boleto' ? CHART_COLORS.amber :
                    CHART_COLORS.slate
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// =====================================================
// Sparkline (mini chart para cards)
// =====================================================

type SparklineProps = {
  data: number[]
  color?: string
  height?: number
}

export function Sparkline({ data, color = '#10B981', height = 40 }: SparklineProps) {
  const chartData = data.map((value, index) => ({ index, value }))
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sparkline-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#sparkline-${color.replace('#', '')})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// =====================================================
// Progress Ring (circular progress)
// =====================================================

type ProgressRingProps = {
  value: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
}

export function ProgressRing({
  value,
  size = 80,
  strokeWidth = 8,
  color = CHART_COLORS.emerald,
  label,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-slate-900">{value}%</span>
        {label && <span className="text-[10px] text-slate-500">{label}</span>}
      </div>
    </div>
  )
}
