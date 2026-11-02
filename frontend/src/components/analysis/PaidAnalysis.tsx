import { useState } from 'react'
import { useCharges } from '../../hooks/useCharges'
import { prorateCharges, type UnitFilter } from '../../utils/units'
import { buildAnalysis, periodsInRange, type GroupBy } from '../../utils/analysis'
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
export function PaidAnalysis({ from, to, unitFilter }: { from: string; to: string; unitFilter: UnitFilter }) {
  const { charges, loading, error, reload } = useCharges(from, to)
  const [groupBy, setGroupBy] = useState<GroupBy>('category')
  // Agrupar por unidad solo tiene sentido mirando todas las unidades y si hay alguna asignada
  const canGroupByUnit = unitFilter === 'all' && charges.some((c) => c.expense.units.length > 0)
  const effectiveGroupBy: GroupBy = canGroupByUnit ? groupBy : 'category'

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

  // Con una unidad elegida, cada gasto cuenta según su porcentaje (Disney+ 50% -> la mitad)
  const a = buildAnalysis(prorateCharges(charges, unitFilter), periodsInRange(from, to), effectiveGroupBy)

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

      <div className="flex flex-col gap-2">
        {canGroupByUnit && (
          <div className="flex items-center gap-2 self-end text-sm">
            <span className="text-gray-400">Agrupar por</span>
            <div className="flex rounded-lg border border-gray-700 p-0.5">
              {(['category', 'unit'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGroupBy(g)}
                  className={`rounded-md px-3 py-1 ${effectiveGroupBy === g ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  {g === 'category' ? 'Categoría' : 'Unidad'}
                </button>
              ))}
            </div>
          </div>
        )}
        <MonthlyCategoryChart
          title={`Lo que pagaste cada mes, por ${effectiveGroupBy === 'category' ? 'categoría' : 'unidad'}`}
          groups={a.groups}
          months={a.months}
          currentPeriod={currentPeriod()}
        />
      </div>
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
