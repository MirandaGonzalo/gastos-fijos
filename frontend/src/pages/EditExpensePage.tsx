import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { deleteExpense, getExpense, updateExpense } from '../api/expenses'
import { ExpenseForm } from '../components/expenses/ExpenseForm'
import { expenseToForm, formToInput } from '../components/expenses/expenseFormUtils'
import type { FixedExpense } from '../types'
import { currentPeriod, formatPeriodLong } from '../utils/dates'

export function EditExpensePage() {
  const { id } = useParams() // el :id de la ruta /gastos/:id/editar
  const expenseId = Number(id)
  const navigate = useNavigate()

  const [result, setResult] = useState<{ id: number; expense: FixedExpense | null; error: string | null } | null>(null)
  const [confirming, setConfirming] = useState<'delete' | 'endNow' | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [working, setWorking] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    getExpense(expenseId, controller.signal)
      .then((expense) => setResult({ id: expenseId, expense, error: null }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setResult({ id: expenseId, expense: null, error: err instanceof Error ? err.message : 'Error desconocido' })
      })
    return () => controller.abort()
  }, [expenseId])

  const loading = result?.id !== expenseId
  const expense = loading ? null : result.expense

  async function runAction(action: () => Promise<unknown>) {
    setWorking(true)
    setActionError(null)
    try {
      await action()
      navigate('/gastos')
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo completar la acción')
    } finally {
      setWorking(false)
      setConfirming(null)
    }
  }

  if (loading) return <div className="p-6 text-gray-400">Cargando gasto...</div>
  if (!expense) {
    return (
      <div className="p-6">
        <p className="text-red-300">No se pudo cargar el gasto: {result?.error}</p>
        <Link to="/gastos" className="mt-3 inline-block text-blue-400 hover:underline">Volver a gastos</Link>
      </div>
    )
  }

  const hasPayments = expense.paidCount > 0
  const now = currentPeriod()

  return (
    <div className="p-6 overflow-y-auto">
      <h1 className="text-2xl font-semibold mb-1">Editar gasto</h1>
      <p className="text-sm text-gray-400 mb-6">
        Los cambios de día y monto se aplican a los cargos pendientes desde este mes. Los pagos registrados no se modifican
        {hasPayments && ` (este gasto tiene ${expense.paidCount} ${expense.paidCount === 1 ? 'pago' : 'pagos'})`}.
      </p>

      {/* key: si cambia el gasto, React crea un form nuevo con sus valores iniciales */}
      <ExpenseForm
        key={expense.id}
        initialValues={expenseToForm(expense)}
        submitLabel="Guardar cambios"
        currencyLockedReason={hasPayments ? 'No se puede cambiar: ya tiene pagos registrados' : undefined}
        onSubmit={async (values) => {
          await updateExpense(expense.id, formToInput(values))
          navigate('/gastos')
        }}
      />

      {/* Zona de peligro: eliminar o dar de baja */}
      <section className="mt-10 max-w-2xl rounded-xl border border-red-900/60 p-4">
        <h2 className="font-medium text-red-300">Dar de baja o eliminar</h2>

        {hasPayments ? (
          <p className="mt-1 text-sm text-gray-400">
            Como tiene pagos registrados, no se puede eliminar (perderías el historial). Podés darlo de baja: deja de generar
            cargos después de {formatPeriodLong(now)} y el historial queda intacto.
          </p>
        ) : (
          <p className="mt-1 text-sm text-gray-400">
            No tiene pagos registrados, así que se puede eliminar por completo junto con sus cargos pendientes.
          </p>
        )}

        {actionError && <p className="mt-3 text-sm text-red-400">{actionError}</p>}

        <div className="mt-4 flex flex-wrap gap-3">
          {confirming ? (
            <>
              <span className="self-center text-sm text-gray-300">
                {confirming === 'delete' ? '¿Eliminar definitivamente?' : `¿Dar de baja después de ${formatPeriodLong(now)}?`}
              </span>
              <button
                disabled={working}
                onClick={() =>
                  runAction(() =>
                    confirming === 'delete' ? deleteExpense(expense.id) : updateExpense(expense.id, { endPeriod: now }),
                  )
                }
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
              >
                {working ? 'Procesando...' : 'Sí, confirmar'}
              </button>
              <button onClick={() => setConfirming(null)} className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm hover:bg-gray-800">
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setConfirming('endNow')} className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm hover:bg-gray-800">
                Dar de baja desde el mes que viene
              </button>
              {!hasPayments && (
                <button onClick={() => setConfirming('delete')} className="rounded-lg border border-red-800 px-3 py-1.5 text-sm text-red-300 hover:bg-red-950/50">
                  Eliminar gasto
                </button>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
