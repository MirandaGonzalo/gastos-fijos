import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatMoney } from '../../utils/format'
import { CHART_COLORS, tooltipStyle } from './colors'

type DebitDayChartProps = {
  data: { day: string; value: number }[]
}

const compact = new Intl.NumberFormat('es-AR', { notation: 'compact', maximumFractionDigits: 1 })

export function DebitDayChart({ data }: DebitDayChartProps) {
  return (
    <section className="rounded-xl border border-gray-800 bg-gray-950/40 p-4">
      <h2 className="text-sm font-medium text-gray-300 mb-2">Cuánto sale cada día del mes</h2>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#1f2937" />
            <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={(v) => `$${compact.format(Number(v))}`}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip
              formatter={(v) => [formatMoney(Number(v), 'ARS'), 'Total']}
              cursor={{ fill: '#1f2937' }}
              {...tooltipStyle}
            />
            <Bar dataKey="value" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
