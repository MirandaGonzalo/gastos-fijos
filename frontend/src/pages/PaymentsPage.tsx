import { useSearchParams } from 'react-router'
import { useCharges } from '../hooks/useCharges'
import { getChargeStatus, type ChargeGroup } from '../utils/chargeStatus'
import { addMonths, currentPeriod, formatPeriodLong } from '../utils/dates'
import { RateNote } from '../components/RateNote'
import { ChargeRow } from '../components/payments/ChargeRow'
import { MonthSummary } from '../components/payments/MonthSummary'

const PERIOD_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/

const GROUPS: { key: ChargeGroup; title: string }[] = [
  { key: 'attention', title: 'Requieren atención' },
  { key: 'upcoming', title: 'Próximos' },
  { key: 'paid', title: 'Pagados' },
]

export function PaymentsPage() {
  // El mes vive en la URL (?mes=2026-10): se puede compartir, recargar y usar "atrás" del navegador
  const [searchParams, setSearchParams] = useSearchParams()
  const param = searchParams.get('mes')
  const period = param && PERIOD_REGEX.test(param) ? param : currentPeriod()
  const isCurrent = period === currentPeriod()

  const { charges, loading, error, reload, replaceCharge } = useCharges(period)

  function goTo(next: string) {
    setSearchParams(next === currentPeriod() ? {} : { mes: next })
  }

  return (
    <div className="p-6 overflow-y-auto">
      {/* Encabezado con navegación de meses */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold mr-auto">Pagos</h1>
        <button onClick={() => goTo(addMonths(period, -1))} className="rounded-lg border border-gray-700 px-3 py-1.5 hover:bg-gray-800" aria-label="Mes anterior">
          ◀
        </button>
        <span className="w-40 text-center font-medium capitalize">{formatPeriodLong(period)}</span>
        <button onClick={() => goTo(addMonths(period, 1))} className="rounded-lg border border-gray-700 px-3 py-1.5 hover:bg-gray-800" aria-label="Mes siguiente">
          ▶
        </button>
        {!isCurrent && (
          <button onClick={() => goTo(currentPeriod())} className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm hover:bg-gray-800">
            Hoy
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-400">Cargando pagos...</p>
      ) : error ? (
        <div className="rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm">
          <p className="text-red-300">No se pudieron cargar los pagos: {error}</p>
          <button onClick={reload} className="mt-3 rounded-lg border border-gray-700 px-3 py-1.5 hover:bg-gray-800">
            Reintentar
          </button>
        </div>
      ) : charges.length === 0 ? (
        <p className="text-gray-400">No hay gastos vigentes para este mes.</p>
      ) : (
        <div className="max-w-4xl flex flex-col gap-6">
          <MonthSummary charges={charges} />

          {GROUPS.map(({ key, title }) => {
            // Agrupa según el estado, que se calcula en cada render (no se guarda)
            const items = charges.filter((c) => getChargeStatus(c).group === key)
            if (items.length === 0) return null
            return (
              <section key={key}>
                <h2 className="mb-1 text-sm font-medium uppercase tracking-wide text-gray-400">
                  {title} <span className="text-gray-600">({items.length})</span>
                </h2>
                <ul className="divide-y divide-gray-800">
                  {items.map((c) => (
                    <ChargeRow key={c.id} charge={c} onUpdated={replaceCharge} />
                  ))}
                </ul>
              </section>
            )
          })}

          <RateNote prefix="Los USD pagados usan la cotización a la que compraste; los pendientes se estiman a" />
        </div>
      )}
    </div>
  )
}
