import type { ExpenseVariation } from '../../utils/analysis'
import { formatMoney, formatPeriod } from '../../utils/format'

function Change({ value }: { value: number | null }) {
  if (value === null) return <span className="text-gray-600">—</span>
  const pct = Math.round(value * 1000) / 10
  const tone = pct > 0 ? 'text-amber-300' : pct < 0 ? 'text-emerald-300' : 'text-gray-400'
  return (
    <span className={tone}>
      {pct > 0 ? '+' : ''}
      {pct.toLocaleString('es-AR')}%
    </span>
  )
}

// Cuánto cambió cada gasto entre su primer y su último pago del período (en pesos)
export function VariationTable({ variations }: { variations: ExpenseVariation[] }) {
  // Los que más subieron primero; los que tienen un solo pago, al final
  const rows = [...variations].sort((a, b) => (b.change ?? -Infinity) - (a.change ?? -Infinity))

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-950/40 p-4">
      <h2 className="text-sm font-medium text-gray-300">Cuánto subió cada gasto</h2>
      <p className="mb-3 text-xs text-gray-500">
        Entre el primer y el último pago del período, en pesos. Los gastos en USD incluyen la suba del dólar.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-gray-500 border-b border-gray-800">
            <tr>
              <th className="py-2 px-2 text-left">Gasto</th>
              <th className="py-2 px-2 text-right">Primer pago</th>
              <th className="py-2 px-2 text-right">Último pago</th>
              <th className="py-2 px-2 text-right">Variación</th>
              <th className="py-2 px-2 text-right">Por mes</th>
              <th className="py-2 px-2 text-right">Total pagado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => (
              <tr key={v.id} className="border-b border-gray-800 last:border-0">
                <td className="py-2 px-2">
                  {v.name}
                  {v.currency === 'USD' && <span className="ml-1.5 text-xs text-gray-500">USD</span>}
                </td>
                <td className="py-2 px-2 text-right">
                  {formatMoney(v.first.amount, 'ARS')}
                  <span className="block text-xs text-gray-500">{formatPeriod(v.first.period)}</span>
                </td>
                <td className="py-2 px-2 text-right">
                  {formatMoney(v.last.amount, 'ARS')}
                  <span className="block text-xs text-gray-500">{formatPeriod(v.last.period)}</span>
                </td>
                <td className="py-2 px-2 text-right font-medium"><Change value={v.change} /></td>
                <td className="py-2 px-2 text-right"><Change value={v.monthlyChange} /></td>
                <td className="py-2 px-2 text-right">
                  {formatMoney(v.total, 'ARS')}
                  <span className="block text-xs text-gray-500">{v.payments} {v.payments === 1 ? 'pago' : 'pagos'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
