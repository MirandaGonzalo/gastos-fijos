import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useCharges } from '../hooks/useCharges'
import { useExchangeRate } from '../context/exchangeRate'
import { buildMonthGrid, WEEKDAYS } from '../utils/calendar'
import { getChargeStatus, TONE_CLASSES } from '../utils/chargeStatus'
import { addMonths, currentPeriod, daysFromToday, formatPeriodLong, parseDate, todayIso } from '../utils/dates'
import { formatMoney } from '../utils/format'
import { chargeToArs } from '../utils/stats'
import { PAYMENT_MODE_INFO } from '../utils/paymentMode'
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/icons'
import type { MonthlyCharge } from '../types'

const PERIOD_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/

// Color de cada pago en la grilla según su situación
function chipClass(c: MonthlyCharge) {
  if (c.status === 'PAID') return 'bg-gray-700/40 text-gray-400 line-through'
  const overdue = daysFromToday(c.dueDate) < 0
  if (c.expense.paymentMode === 'MANUAL') {
    return overdue ? 'bg-red-500/20 text-red-200' : 'bg-amber-500/20 text-amber-200'
  }
  return overdue ? 'bg-amber-500/20 text-amber-200' : 'bg-blue-500/20 text-blue-200'
}

export function CalendarPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const param = searchParams.get('mes')
  const period = param && PERIOD_REGEX.test(param) ? param : currentPeriod()
  const today = todayIso()

  const { charges, loading, error, reload } = useCharges(period)
  const { rate } = useExchangeRate()
  const [selected, setSelected] = useState<string | null>(today)

  function goTo(next: string) {
    setSearchParams(next === currentPeriod() ? {} : { mes: next })
    setSelected(next === currentPeriod() ? today : null)
  }

  // Agrupa los cargos por fecha: { "2026-10-10": [cargo, cargo], ... }
  const byDate = new Map<string, MonthlyCharge[]>()
  for (const c of charges) {
    byDate.set(c.dueDate, [...(byDate.get(c.dueDate) ?? []), c])
  }

  const grid = buildMonthGrid(period)
  const monthTotal = charges.reduce((acc, c) => acc + chargeToArs(c, rate), 0)
  const selectedCharges = selected ? (byDate.get(selected) ?? []) : []

  return (
    <div className="p-6 overflow-y-auto">
      {/* Encabezado */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-2xl font-semibold">Calendario</h1>
        <button onClick={() => goTo(addMonths(period, -1))} className="rounded-lg border border-gray-700 p-2 hover:bg-gray-800" aria-label="Mes anterior">
          <ChevronLeftIcon />
        </button>
        <span className="w-40 text-center font-medium capitalize">{formatPeriodLong(period)}</span>
        <button onClick={() => goTo(addMonths(period, 1))} className="rounded-lg border border-gray-700 p-2 hover:bg-gray-800" aria-label="Mes siguiente">
          <ChevronRightIcon />
        </button>
        {period !== currentPeriod() && (
          <button onClick={() => goTo(currentPeriod())} className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm hover:bg-gray-800">
            Hoy
          </button>
        )}
      </div>

      {/* Referencias */}
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-400">
        <Legend className="bg-blue-500/20" label="Débito automático" />
        <Legend className="bg-amber-500/20" label="Vencimiento manual / a confirmar" />
        <Legend className="bg-red-500/20" label="Vencido" />
        <Legend className="bg-gray-700/40" label="Pagado" />
        {!loading && !error && (
          <span className="ml-auto text-sm text-gray-300">
            Total del mes: <span className="font-medium">{formatMoney(monthTotal, 'ARS')}</span>
          </span>
        )}
      </div>

      {error ? (
        <div className="rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm">
          <p className="text-red-300">No se pudo cargar el calendario: {error}</p>
          <button onClick={reload} className="mt-3 rounded-lg border border-gray-700 px-3 py-1.5 hover:bg-gray-800">
            Reintentar
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_20rem] gap-4">
          {/* Grilla del mes */}
          <div className={`overflow-hidden rounded-xl border border-gray-800 ${loading ? 'opacity-50' : ''}`}>
            <div className="grid grid-cols-7 bg-gray-950/60 text-center text-xs uppercase text-gray-500">
              {WEEKDAYS.map((d) => (
                <div key={d} className="py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {grid.map((cell) => {
                const items = byDate.get(cell.date) ?? []
                const isToday = cell.date === today
                const isSelected = cell.date === selected
                return (
                  <button
                    key={cell.date}
                    onClick={() => setSelected(cell.date)}
                    disabled={!cell.inMonth}
                    className={`flex min-h-24 flex-col gap-1 border-t border-l border-gray-800 p-1.5 text-left [&:nth-child(7n+1)]:border-l-0 ${
                      cell.inMonth ? 'hover:bg-gray-800/50' : 'bg-gray-950/40 text-gray-600'
                    } ${isSelected ? 'bg-gray-800/70 ring-1 ring-inset ring-blue-500' : ''}`}
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                        isToday ? 'bg-blue-600 font-semibold text-white' : ''
                      }`}
                    >
                      {cell.day}
                    </span>
                    {cell.inMonth &&
                      items.slice(0, 3).map((c) => (
                        <span key={c.id} className={`truncate rounded px-1.5 py-0.5 text-[11px] ${chipClass(c)}`}>
                          {c.expense.name}
                        </span>
                      ))}
                    {cell.inMonth && items.length > 3 && (
                      <span className="px-1.5 text-[11px] text-gray-400">+{items.length - 3} más</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Detalle del día elegido */}
          <aside className="rounded-xl border border-gray-800 bg-gray-950/40 p-4 self-start">
            {selected && selected.startsWith(period) ? (
              <>
                <h2 className="font-medium capitalize">
                  {parseDate(selected).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h2>
                {selectedCharges.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-500">No cae ningún pago este día.</p>
                ) : (
                  <ul className="mt-3 flex flex-col gap-3">
                    {selectedCharges.map((c) => {
                      const status = getChargeStatus(c)
                      return (
                        <li key={c.id} className="rounded-lg bg-gray-800/40 p-3">
                          <div className="flex items-start gap-2">
                            <span className="flex-1 font-medium">{c.expense.name}</span>
                            <span className="font-medium">{formatMoney(c.amount, c.expense.currency)}</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {c.expense.category.name} · {PAYMENT_MODE_INFO[c.expense.paymentMode].label} · {c.expense.paymentMethod.name}
                          </p>
                          <span className={`mt-2 inline-block rounded px-2 py-0.5 text-xs ${TONE_CLASSES[status.tone]}`}>
                            {status.label}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                )}
                <Link to={period === currentPeriod() ? '/pagos' : `/pagos?mes=${period}`} className="mt-4 inline-flex items-center gap-1.5 text-sm text-blue-400 hover:underline">
                  Ir a pagos del mes <ArrowRightIcon />
                </Link>
              </>
            ) : (
              <p className="text-sm text-gray-500">Elegí un día para ver qué pagos caen.</p>
            )}
          </aside>
        </div>
      )}
    </div>
  )
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-sm ${className}`} />
      {label}
    </span>
  )
}
