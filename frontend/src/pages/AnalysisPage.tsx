import { useSearchParams } from 'react-router'
import { useExpenses } from '../hooks/useExpenses'
import { useExchangeRate } from '../context/exchangeRate'
import { totalsBy, totalsByDay } from '../utils/stats'
import { addMonths, currentPeriod } from '../utils/dates'
import { DonutCard } from '../components/charts/DonutCard'
import { DebitDayChart } from '../components/charts/DebitDayChart'
import { TotalsSummary } from '../components/charts/TotalsSummary'
import { RateNote } from '../components/RateNote'
import { PaidAnalysis } from '../components/analysis/PaidAnalysis'
import { UnitFilterSelect } from '../components/UnitFilterSelect'
import { useUnitFilter } from '../hooks/useUnitFilter'
import { prorateExpenses, totalsByUnit } from '../utils/units'

// Opciones de período: el valor va en la URL (?periodo=6)
const RANGES = [
  { key: '3', label: '3 meses' },
  { key: '6', label: '6 meses' },
  { key: '12', label: '12 meses' },
  { key: 'anio', label: 'Este año' },
] as const

function rangeFor(key: string): { from: string; to: string } {
  const to = currentPeriod()
  if (key === 'anio') return { from: `${to.slice(0, 4)}-01`, to }
  const months = Number(key) || 6
  return { from: addMonths(to, -(months - 1)), to }
}

export function AnalysisPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const rangeKey = RANGES.some((r) => r.key === searchParams.get('periodo')) ? searchParams.get('periodo')! : '6'
  const { from, to } = rangeFor(rangeKey)

  const { rate } = useExchangeRate()
  const { expenses: allExpenses, loading, error } = useExpenses()
  const { unitFilter, setUnitFilter } = useUnitFilter()
  const expenses = prorateExpenses(allExpenses, unitFilter)
  const byUnit = totalsByUnit(allExpenses, rate)
  const hasUnits = allExpenses.some((e) => e.units.length > 0)

  return (
    <div className="p-6 overflow-y-auto">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-2xl font-semibold">Análisis</h1>
        <UnitFilterSelect value={unitFilter} onChange={setUnitFilter} />
        {/* Selector de período */}
        <div className="flex rounded-lg border border-gray-700 p-0.5 text-sm">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() =>
                setSearchParams((prev) => {
                  const params = new URLSearchParams(prev)
                  if (r.key === '6') params.delete('periodo')
                  else params.set('periodo', r.key)
                  return params
                })
              }
              className={`rounded-md px-3 py-1 ${rangeKey === r.key ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Lo que realmente pagaste */}
      <h2 className="mb-3 text-lg font-medium">Lo que pagaste</h2>
      {/* key: al cambiar el período, se monta de nuevo con su propia carga */}
      <PaidAnalysis key={`${from}-${to}`} from={from} to={to} unitFilter={unitFilter} />

      {/* 2. La estructura de los gastos según los montos estimados */}
      <h2 className="mt-10 mb-1 text-lg font-medium">Cómo se reparten tus gastos fijos</h2>
      <p className="mb-3 text-sm text-gray-400">Según el monto estimado de cada gasto activo.</p>
      {loading ? (
        <p className="text-gray-400">Cargando...</p>
      ) : error ? (
        <p className="text-sm text-red-300">No se pudieron cargar los gastos: {error}</p>
      ) : expenses.length === 0 && allExpenses.length > 0 ? (
        <p className="text-gray-400">Esta unidad no tiene gastos asignados.</p>
      ) : expenses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {unitFilter === 'all' && hasUnits && <DonutCard title="Por unidad" data={byUnit} />}
            <DonutCard title="Por categoría" data={totalsBy(expenses, 'category', rate)} />
            <DonutCard title="Por medio de pago" data={totalsBy(expenses, 'paymentMethod', rate)} />
            <DebitDayChart data={totalsByDay(expenses, rate)} />
            <TotalsSummary expenses={expenses} />
          </div>
          <div className="mt-2">
            <RateNote prefix="Los gastos en USD se convierten a" />
          </div>
        </>
      ) : null}
    </div>
  )
}
