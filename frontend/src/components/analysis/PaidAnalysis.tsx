import { useCharges } from '../../hooks/useCharges'
import { buildAnalysis, periodsInRange } from '../../utils/analysis'
import { currentPeriod, formatPeriodLong } from '../../utils/dates'
import { formatMoney } from '../../utils/format'
import { MonthlyCategoryChart } from './MonthlyCategoryChart'
import { VariationTable } from './VariationTable'

const card = 'rounded-xl border border-gray-800 bg-gray-950/40 p-4'

function pct(value: number) {
  const n = Math.round(value * 1000) / 10
  return `${n > 0 ? '+' : ''}${n.toLocaleString('es-AR')}%`
}

// Todo lo que sale de los pagos reales de un rango de meses
export function PaidAnalysis({ from, to }: { from: string; to: string }) {
  const { charges, loading, error, reload } = useCharges(from, to)

  if (loading) return <p className="text-gray-400">Cargando pagos...</p>
  if (error) {
    return (
      <div className="rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm">
        <p className="text-red-300">No se pudieron cargar los pagos: {error}</p>
        <button onClick={reload} className="mt-3 rounded-lg border border-gray-700 px-3 py-1.5 hover:bg-gray-800">
          Reintentar
        </button>
      </div>
    )
  }

  const a = buildAnalysis(charges, periodsInRange(from, to))

  if (a.monthsWithPayments === 0) {
    return <p className="text-gray-400">No hay pagos registrados entre {formatPeriodLong(from)} y {formatPeriodLong(to)}.</p>
  }

  const kpis = [
    { label: 'Total pagado', value: formatMoney(a.total, 'ARS'), sub: `en ${a.monthsWithPayments} ${a.monthsWithPayments === 1 ? 'mes' : 'meses'}` },
    { label: 'Promedio mensual', value: formatMoney(a.average, 'ARS'), sub: 'meses con pagos registrados' },
    {
      label: 'Suba promedio',
      value: a.averageChange === null ? '—' : pct(a.averageChange),
      sub: 'de cada gasto, en el período',
    },
    {
      label: 'El que más subió',
      value: a.topRiser ? a.topRiser.name : '—',
      sub: a.topRiser?.change != null ? pct(a.topRiser.change) : 'falta más historial',
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <section key={k.label} className={card}>
            <p className="text-xs text-gray-400">{k.label}</p>
            <p className="mt-1 truncate text-2xl font-semibold tracking-tight">{k.value}</p>
            <p className="text-xs text-gray-500">{k.sub}</p>
          </section>
        ))}
      </div>

      <MonthlyCategoryChart categories={a.categories} months={a.months} currentPeriod={currentPeriod()} />
      <VariationTable variations={a.variations} />

      {a.missingRate > 0 && (
        <p className="text-xs text-amber-400">
          {a.missingRate} {a.missingRate === 1 ? 'pago en USD no tiene' : 'pagos en USD no tienen'} cotización cargada y no se
          incluyen. Editalos desde Pagos para sumarlos.
        </p>
      )}
    </div>
  )
}
