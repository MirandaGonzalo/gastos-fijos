import { useNavigate } from 'react-router'
import { createExpense } from '../api/expenses'
import { ExpenseForm } from '../components/expenses/ExpenseForm'
import { emptyExpenseForm, formToInput } from '../components/expenses/expenseFormUtils'

export function NewExpensePage() {
  const navigate = useNavigate()

  return (
    <div className="p-6 overflow-y-auto">
      <h1 className="text-2xl font-semibold mb-1">Nuevo gasto</h1>
      <p className="text-sm text-gray-400 mb-6">
        El monto es una estimación: cada mes vas a poder ajustarlo al valor real.
      </p>

      <ExpenseForm
        initialValues={emptyExpenseForm()}
        submitLabel="Guardar gasto"
        onSubmit={async (values) => {
          const { endPeriod, ...rest } = formToInput(values)
          await createExpense({ ...rest, endPeriod: endPeriod ?? undefined })
          navigate('/gastos') // al volver, la tabla vuelve a pedir los datos
        }}
      />
    </div>
  )
}
