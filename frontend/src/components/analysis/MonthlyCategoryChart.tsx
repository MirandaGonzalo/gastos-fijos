import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatMoney } from '../../utils/format'
import { formatPeriod } from '../../utils/format'
import { CHART_COLORS, tooltipStyle } from '../charts/colors'

type Props = {
  categories: string[]
  months: ({ period: string; total: number } & Record<string, number | string>)[]
  currentPeriod: string
}

const compact = new Intl.NumberFormat('es-AR', { notation: 'compact', maximumFractionDigits: 1 })
const SURFACE = '#0b1020' // mismo tono que el fondo de la tarjeta: separa los segmentos apilados

export function MonthlyCategoryChart({ categories, months, currentPeriod }: Props) {
  const data = months.map((m) => ({
    ...m,
    label: formatPeriod(m.period) + (m.period === currentPeriod ? ' *' : ''),
  }))

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-950/40 p-4">
      <h2 className="text-sm font-medium text-gray-300">Lo que pagaste cada mes, por categoría</h2>
      <p className="mb-3 text-xs text-gray-500">* mes en curso: todavía faltan pagos</p>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#1f2937" />
            <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={(v) => `$${compact.format(Number(v))}`}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip
              formatter={(v, name) => [formatMoney(Number(v), 'ARS'), String(name)]}
              cursor={{ fill: '#1f2937' }}
              {...tooltipStyle}
            />
            {categories.map((cat, i) => (
              <Bar key={cat} dataKey={cat} stackId="total" fill={CHART_COLORS[i]} stroke={SURFACE} strokeWidth={2} maxBarSize={56} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda: el color identifica la categoría, el texto queda en gris */}
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-300">
        {categories.map((cat, i) => (
          <li key={cat} className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm" style={{ background: CHART_COLORS[i] }} />
            {cat}
          </li>
        ))}
      </ul>
    </section>
  )
}
