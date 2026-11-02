import { Link } from 'react-router'
import { useExpenses } from '../hooks/useExpenses'
import { ExpensesTable } from '../components/expenses/ExpensesTable'
import { PlusIcon } from '../components/icons'
import { UnitFilterSelect } from '../components/UnitFilterSelect'
import { useUnitFilter } from '../hooks/useUnitFilter'
import { shareFor } from '../utils/units'

export function ExpensesPage() {
  const { expenses: allExpenses, loading, error, reload } = useExpenses()
  const { unitFilter, setUnitFilter } = useUnitFilter()
  // Con una unidad elegida, solo los gastos que le corresponden (aunque sea en parte)
  const expenses = allExpenses.filter((e) => shareFor(e.units, unitFilter) > 0)

  return (
    // Columna del alto de la pantalla: el encabezado arriba y la tabla ocupa el resto
    <div className="flex h-full min-h-0 flex-col p-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-2xl font-semibold">Gastos fijos</h1>
        <UnitFilterSelect value={unitFilter} onChange={setUnitFilter} />
        <Link to="/analisis" className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm hover:bg-gray-800">
          Ver análisis
        </Link>
        <Link
          to="/gastos/nuevo"
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
        >
          <PlusIcon /> Nuevo gasto
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-400">Cargando gastos...</p>
      ) : error ? (
        <div className="rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm">
          <p className="text-red-300">No se pudieron cargar los gastos: {error}</p>
          <button onClick={reload} className="mt-3 rounded-lg border border-gray-700 px-3 py-1.5 hover:bg-gray-800">
            Reintentar
          </button>
        </div>
      ) : allExpenses.length > 0 && expenses.length === 0 ? (
        <p className="text-gray-400">Esta unidad no tiene gastos asignados.</p>
      ) : expenses.length === 0 ? (
        <p className="text-gray-400">
          Todavía no cargaste gastos. <Link to="/gastos/nuevo" className="text-blue-400 hover:underline">Cargá el primero</Link>.
        </p>
      ) : (
        <ExpensesTable expenses={expenses} />
      )}
    </div>
  )
}
