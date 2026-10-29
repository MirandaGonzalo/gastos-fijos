import { Link } from 'react-router'
import { useCharges } from '../hooks/useCharges'
import { useExchangeRate } from '../context/exchangeRate'
import { buildHomeSummary, relativeDays } from '../utils/homeSummary'
import { addMonths, currentPeriod, daysFromToday, formatShortDate, formatWeekday } from '../utils/dates'
import { formatMoney } from '../utils/format'
import { AlertIcon, ArrowRightIcon, CalendarIcon, ChartIcon, ListIcon, PlusIcon } from '../components/icons'
import type { MonthlyCharge } from '../types'

const card = 'rounded-xl border border-gray-800 bg-gray-950/40 p-5'

export function HomePage() {
  const now = currentPeriod()
  // Mes anterior (para comparar), actual y siguiente (para saber qué viene si este ya está pago)
  const { charges, loading, error, reload } = useCharges(addMonths(now, -1), addMonths(now, 1))
  const { rate } = useExchangeRate()

  const today = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="p-6 overflow-y-auto">
      <div className="max-w-5xl">
        <p className="text-sm capitalize text-gray-400">{today}</p>
        <h1 className="mb-6 text-2xl font-semibold">Hola, Gonzalo</h1>

        {loading ? (
          <p className="text-gray-400">Cargando tu resumen...</p>
        ) : error ? (
          <div className="rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm">
            <p className="text-red-300">No se pudo cargar el resumen: {error}</p>
            <button onClick={reload} className="mt-3 rounded-lg border border-gray-700 px-3 py-1.5 hover:bg-gray-800">
              Reintentar
            </button>
          </div>
        ) : (
          <HomeContent charges={charges} now={now} rate={rate} />
        )}
      </div>
    </div>
  )
}

function HomeContent({ charges, now, rate }: { charges: MonthlyCharge[]; now: string; rate: number | null }) {
  const { next, nextWeek, overdue, month, previousTotal, change } = buildHomeSummary(charges, now, rate)
  const percent = month.total > 0 ? Math.round((month.paid / month.total) * 100) : 0

  return (
    <div className="flex flex-col gap-4">
      {/* Alerta: solo aparece si hay algo vencido o sin confirmar */}
      {overdue.length > 0 && (
        <Link
          to="/pagos"
          className="flex items-center gap-3 rounded-xl border border-amber-800/60 bg-amber-950/30 p-4 text-amber-200 hover:bg-amber-950/50"
        >
          <AlertIcon className="h-5 w-5 shrink-0" />
          <span className="flex-1 text-sm">
            {overdue.length === 1
              ? `${overdue[0].expense.name} ya pasó su fecha y no está registrado como pagado.`
              : `Tenés ${overdue.length} pagos con la fecha pasada sin registrar.`}
          </span>
          <span className="text-sm font-medium">Revisar</span>
          <ArrowRightIcon />
        </Link>
      )}

      {/* Lo principal: qué viene */}
      <NextDueCard next={next} />

      {/* El mes en tres números */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <section className={card}>
          <p className="text-sm text-gray-400">Este mes pagaste</p>
          <p className="mt-1 text-2xl font-semibold">{formatMoney(month.paid, 'ARS')}</p>
          <p className="text-sm text-gray-500">de {formatMoney(month.total, 'ARS')}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-800">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {month.paidCount} de {month.count} pagos · {percent}%
          </p>
        </section>

        <section className={card}>
          <p className="text-sm text-gray-400">Te falta pagar</p>
          <p className="mt-1 text-2xl font-semibold">{formatMoney(month.pending, 'ARS')}</p>
          <p className="text-sm text-gray-500">
            {month.pending === 0
              ? 'Estás al día este mes'
              : month.pendingUsd > 0
                ? `${formatMoney(month.pendingArs, 'ARS')} + ${formatMoney(month.pendingUsd, 'USD')}`
                : 'todo en pesos'}
          </p>
        </section>

        <section className={card}>
          <p className="text-sm text-gray-400">Frente al mes pasado</p>
          {change === null || previousTotal === null ? (
            <p className="mt-1 text-sm text-gray-500">Todavía no hay datos del mes pasado.</p>
          ) : (
            <>
              <p className={`mt-1 text-2xl font-semibold ${change > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>
                {change > 0 ? '+' : ''}
                {Math.round(change * 100)}%
              </p>
              <p className="text-sm text-gray-500">
                {change > 0 ? 'más' : 'menos'} que en el mes pasado ({formatMoney(previousTotal, 'ARS')})
              </p>
            </>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Próximos 7 días */}
        <section className={`${card} lg:col-span-2`}>
          <div className="mb-2 flex items-center">
            <h2 className="mr-auto font-medium">Próximos 7 días</h2>
            <Link to="/pagos" className="text-sm text-blue-400 hover:underline">Ver todos</Link>
          </div>
          {nextWeek.length === 0 ? (
            <p className="text-sm text-gray-500">No hay nada que pagar en los próximos 7 días.</p>
          ) : (
            <ul className="divide-y divide-gray-800">
              {nextWeek.map((c) => (
                <li key={c.id} className="flex items-center gap-3 py-2 text-sm">
                  <span className="w-14 shrink-0 text-gray-400">
                    {formatWeekday(c.dueDate)} {formatShortDate(c.dueDate).slice(0, 2)}
                  </span>
                  <span className="flex-1 truncate">{c.expense.name}</span>
                  <span className="text-xs text-gray-500">{relativeDays(daysFromToday(c.dueDate))}</span>
                  <span className="w-28 text-right font-medium">{formatMoney(c.amount, c.expense.currency)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Accesos rápidos */}
        <section className={card}>
          <h2 className="mb-2 font-medium">Accesos rápidos</h2>
          <nav className="flex flex-col gap-1 text-sm">
            {[
              { to: '/pagos', label: 'Registrar un pago', icon: CalendarIcon },
              { to: '/gastos/nuevo', label: 'Cargar un gasto nuevo', icon: PlusIcon },
              { to: '/gastos', label: 'Ver todos mis gastos', icon: ListIcon },
              { to: '/analisis', label: 'Ver el análisis', icon: ChartIcon },
            ].map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className="flex items-center gap-3 rounded-lg px-2 py-2 text-gray-300 hover:bg-gray-800 hover:text-white">
                <Icon className="h-4 w-4 text-gray-500" />
                {label}
              </Link>
            ))}
          </nav>
        </section>
      </div>
    </div>
  )
}

// La tarjeta grande: el próximo pago, con el texto según sea débito automático o vencimiento
function NextDueCard({ next }: { next: MonthlyCharge | null }) {
  if (!next) {
    return (
      <section className={card}>
        <p className="text-sm text-gray-400">Próximo pago</p>
        <p className="mt-1 text-xl font-semibold">No tenés pagos pendientes por ahora.</p>
      </section>
    )
  }

  const diff = daysFromToday(next.dueDate)
  const isAutomatic = next.expense.paymentMode === 'AUTOMATIC'
  const verb = isAutomatic ? 'se debita' : 'vence'

  return (
    <section className={`${card} flex flex-wrap items-end gap-6 bg-gradient-to-br from-blue-950/40 to-gray-950/40`}>
      <div className="flex-1 min-w-60">
        <p className="text-sm text-gray-400">{isAutomatic ? 'Próximo débito' : 'Próximo vencimiento'}</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight">
          {next.expense.name} {verb} {relativeDays(diff)}
        </p>
        <p className="mt-1 text-sm text-gray-400">
          {formatWeekday(next.dueDate)} {formatShortDate(next.dueDate)} · {next.expense.category.name} ·{' '}
          {isAutomatic ? `débito automático en ${next.expense.paymentMethod.name}` : `pago manual con ${next.expense.paymentMethod.name}`}
        </p>
      </div>
      <div className="text-right">
        <p className="text-3xl font-semibold">{formatMoney(next.amount, next.expense.currency)}</p>
        <Link
          to={`/pagos?mes=${next.period}`}
          className="mt-2 inline-flex items-center gap-1.5 text-sm text-blue-400 hover:underline"
        >
          {isAutomatic ? 'Ver en pagos' : 'Ir a pagar'} <ArrowRightIcon />
        </Link>
      </div>
    </section>
  )
}
