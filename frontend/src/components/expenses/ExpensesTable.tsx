import { useState } from 'react'
import { Link } from 'react-router'
import type { FixedExpense } from '../../types'
import { formatMoney, formatPeriod } from '../../utils/format'
import { PAYMENT_MODE_INFO } from '../../utils/paymentMode'
import { toArs } from '../../utils/stats'
import { PencilIcon } from '../icons'
import { useExchangeRate } from '../../context/exchangeRate'

type SortKey = 'name' | 'category' | 'debitDay' | 'paymentMethod' | 'startPeriod' | 'amount'
type SortDir = 'asc' | 'desc'

// Cómo comparar dos gastos según cada columna (el monto necesita la cotización)
const makeComparators = (rate: number | null): Record<SortKey, (a: FixedExpense, b: FixedExpense) => number> => ({
  name: (a, b) => a.name.localeCompare(b.name, 'es'),
  category: (a, b) => a.category.name.localeCompare(b.category.name, 'es'),
  debitDay: (a, b) => a.debitDay - b.debitDay,
  paymentMethod: (a, b) => a.paymentMethod.name.localeCompare(b.paymentMethod.name, 'es'),
  startPeriod: (a, b) => a.startPeriod.localeCompare(b.startPeriod),
  amount: (a, b) => toArs(a, rate) - toArs(b, rate), // en pesos, para comparar ARS con USD
})

const columns: { key: SortKey; label: string; align?: 'right' }[] = [
  { key: 'name', label: 'Nombre' },
  { key: 'category', label: 'Categoría' },
  { key: 'debitDay', label: 'Fecha' },
  { key: 'paymentMethod', label: 'Medio de pago' },
  { key: 'startPeriod', label: 'Vigencia' },
  { key: 'amount', label: 'Monto estimado', align: 'right' },
]

export function ExpensesTable({ expenses }: { expenses: FixedExpense[] }) {
  const { rate } = useExchangeRate()
  const compareBy = makeComparators(rate)
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'debitDay', dir: 'asc' })

  // Click en la misma columna invierte el orden; en otra, ordena ascendente por esa
  function toggleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' },
    )
  }

  // Estado derivado: no se guarda el array ordenado, se calcula en cada render
  const sorted = [...expenses].sort((a, b) => {
    const result = compareBy[sort.key](a, b)
    return sort.dir === 'asc' ? result : -result
  })

  return (
    // Alto máximo de media pantalla; si hay más gastos, scrollea solo la tabla
    <div className="max-h-[50vh] overflow-y-auto rounded-xl border border-gray-800">
      <table className="w-full text-sm text-left">
        {/* sticky: el encabezado queda fijo arriba mientras scrolleás */}
        <thead className="sticky top-0 z-10 bg-gray-900 text-xs uppercase text-gray-400 shadow-[0_1px_0_0_#1f2937]">
          <tr>
            {columns.map((col) => {
              const active = sort.key === col.key
              return (
                <th
                  key={col.key}
                  className="p-0"
                  aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <button
                    onClick={() => toggleSort(col.key)}
                    className={`flex w-full items-center gap-1 px-3 py-2 uppercase hover:text-gray-200 ${
                      col.align === 'right' ? 'justify-end' : ''
                    } ${active ? 'text-gray-100' : ''}`}
                  >
                    {col.label}
                    <span className={active ? 'opacity-100' : 'opacity-0'}>
                      {sort.dir === 'asc' || !active ? '▲' : '▼'}
                    </span>
                  </button>
                </th>
              )
            })}
            <th className="w-12 px-3 py-2"><span className="sr-only">Acciones</span></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((e) => (
            <tr
              key={e.id}
              className={`border-b border-gray-800 last:border-0 hover:bg-gray-800/50 ${e.active ? '' : 'opacity-40'}`}
            >
              <td className="py-2 px-3">{e.name}</td>
              <td className="py-2 px-3 text-gray-400">{e.category.name}</td>
              <td className="py-2 px-3">
                <span className="block">{PAYMENT_MODE_INFO[e.paymentMode].dayPrefix} {e.debitDay}</span>
                <span
                  className={`mt-0.5 inline-block rounded px-1.5 py-0.5 text-xs ${
                    e.paymentMode === 'AUTOMATIC' ? 'bg-blue-500/15 text-blue-300' : 'bg-amber-500/15 text-amber-300'
                  }`}
                >
                  {PAYMENT_MODE_INFO[e.paymentMode].label}
                </span>
              </td>
              <td className="py-2 px-3 text-gray-400">{e.paymentMethod.name}</td>
              <td className="py-2 px-3 text-gray-400">
                {formatPeriod(e.startPeriod)} → {e.endPeriod ? formatPeriod(e.endPeriod) : 'sin fin'}
              </td>
              <td className="py-2 px-3 text-right font-medium">{formatMoney(e.estimatedAmount, e.currency)}</td>
              <td className="py-2 px-3 text-right">
                <Link
                  to={`/gastos/${e.id}/editar`}
                  aria-label={`Editar ${e.name}`}
                  title="Editar"
                  className="inline-flex rounded-md p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white"
                >
                  <PencilIcon />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
