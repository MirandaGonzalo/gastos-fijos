import type { FixedExpense } from '../../types'
import { formatMoney } from '../../utils/format'
import { monthlySummary } from '../../utils/stats'
import { useExchangeRate } from '../../context/exchangeRate'

type Props = {
  expenses: FixedExpense[]
}

// Tarjeta "cuánto hay que pagar por mes", discriminado por categoría
export function TotalsSummary({ expenses }: Props) {
  const { rate } = useExchangeRate()
  const { categories, totalArs, nativeArs, nativeUsd, count } = monthlySummary(expenses, rate)

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-950/40 p-4 flex flex-col">
      <h2 className="text-sm font-medium text-gray-300">Total a pagar por mes</h2>

      <p className="mt-2 text-4xl font-semibold tracking-tight">{formatMoney(totalArs, 'ARS')}</p>
      <p className="mt-1 text-sm text-gray-400">
        {formatMoney(nativeArs, 'ARS')}
        {nativeUsd > 0 && <> + {formatMoney(nativeUsd, 'USD')}</>}
        {' · '}
        {count} {count === 1 ? 'gasto activo' : 'gastos activos'}
      </p>

      <ul className="mt-4 flex-1 flex flex-col divide-y divide-gray-800 text-sm">
        {categories.map((c) => (
          <li key={c.name} className="flex items-center gap-3 py-2">
            <span className="flex-1 truncate text-gray-200">{c.name}</span>
            <span className="text-xs text-gray-500">
              {c.count} {c.count === 1 ? 'gasto' : 'gastos'}
            </span>
            <span className="w-14 text-right text-gray-400">
              {totalArs > 0 ? Math.round((c.total / totalArs) * 100) : 0}%
            </span>
            <span className="w-32 text-right font-medium text-gray-100">{formatMoney(c.total, 'ARS')}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
