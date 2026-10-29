import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { Slice } from '../../utils/stats'
import { formatMoney } from '../../utils/format'
import { CHART_COLORS, tooltipStyle } from './colors'

type DonutCardProps = {
  title: string
  data: Slice[]
}

export function DonutCard({ title, data }: DonutCardProps) {
  const total = data.reduce((sum, s) => sum + s.value, 0)

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-950/40 p-4">
      <h2 className="text-sm font-medium text-gray-300 mb-2">{title}</h2>

      {data.length === 0 ? (
        <p className="text-sm text-gray-500">Sin datos.</p>
      ) : (
        <div className="flex items-center gap-4">
          <div className="h-48 w-48 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="95%" paddingAngle={2} stroke="none">
                  {data.map((s, i) => (
                    <Cell key={s.name} fill={CHART_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatMoney(Number(v), 'ARS')} {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Leyenda con nombre, porcentaje y monto */}
          <ul className="flex-1 flex flex-col gap-2 text-sm">
            {data.map((s, i) => (
              <li key={s.name} className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm shrink-0" style={{ background: CHART_COLORS[i] }} />
                <span className="flex-1 truncate text-gray-200">{s.name}</span>
                <span className="text-gray-400">{Math.round((s.value / total) * 100)}%</span>
                <span className="w-28 text-right text-gray-300">{formatMoney(s.value, 'ARS')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
