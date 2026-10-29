import { Link } from 'react-router'
import { useExpenses } from '../hooks/useExpenses'
import { ExpensesTable } from '../components/expenses/ExpensesTable'
import { PlusIcon } from '../components/icons'

export function ExpensesPage() {
  const { expenses, loading, error, reload } = useExpenses()

  return (
    <div className="p-6 overflow-y-auto">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-2xl font-semibold">Gastos fijos</h1>
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
