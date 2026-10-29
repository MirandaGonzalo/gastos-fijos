import { useState } from 'react'
import { Link } from 'react-router'
import { useCatalog } from '../../hooks/useCatalog'
import type { PaymentMode } from '../../types'
import { PAYMENT_MODE_INFO } from '../../utils/paymentMode'
import { validateExpenseForm, type ExpenseFormErrors, type ExpenseFormValues } from './expenseFormUtils'

type Props = {
  initialValues: ExpenseFormValues
  submitLabel: string
  onSubmit: (values: ExpenseFormValues) => Promise<void> // si falla, lanza y el form muestra el error
  currencyLockedReason?: string // si viene, la moneda no se puede cambiar y se explica por qué
}

const inputClass =
  'w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm outline-none focus:border-blue-500'

// El mismo formulario sirve para crear y para editar: cambia solo lo que recibe por props
export function ExpenseForm({ initialValues, submitLabel, onSubmit, currencyLockedReason }: Props) {
  const [form, setForm] = useState<ExpenseFormValues>(initialValues)
  const [errors, setErrors] = useState<ExpenseFormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const categories = useCatalog('categories')
  const paymentMethods = useCatalog('payment-methods')

  // Un solo handler para todos los inputs: usa el atributo name para saber qué campo cambiar
  // Los checkbox guardan su valor en .checked, no en .value
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    const isCheckbox = e.target instanceof HTMLInputElement && e.target.type === 'checkbox'
    setForm((prev) => ({ ...prev, [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationErrors = validateExpenseForm(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSubmitting(true)
    setApiError(null)
    try {
      await onSubmit(form)
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'No se pudo guardar el gasto')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Nombre" error={errors.name} className="sm:col-span-2">
        <input name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="Luz, Internet, Alquiler..." />
      </Field>

      <Field label="Monto estimado" error={errors.estimatedAmount}>
        <input name="estimatedAmount" type="number" min="0" step="0.01" value={form.estimatedAmount} onChange={handleChange} className={inputClass} />
      </Field>

      <Field label="Moneda" hint={currencyLockedReason}>
        <select name="currency" value={form.currency} onChange={handleChange} className={inputClass} disabled={!!currencyLockedReason}>
          <option value="ARS">Pesos (ARS)</option>
          <option value="USD">Dólares (USD)</option>
        </select>
      </Field>

      <fieldset className="sm:col-span-2 flex flex-col gap-2">
        <legend className="text-sm text-gray-300 mb-1">¿Cómo se paga?</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(Object.keys(PAYMENT_MODE_INFO) as PaymentMode[]).map((mode) => (
            <label
              key={mode}
              className={`cursor-pointer rounded-lg border px-3 py-2 ${
                form.paymentMode === mode ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:bg-gray-800'
              }`}
            >
              <input
                type="radio"
                name="paymentMode"
                value={mode}
                checked={form.paymentMode === mode}
                onChange={handleChange}
                className="sr-only"
              />
              <span className="block text-sm font-medium">{PAYMENT_MODE_INFO[mode].label}</span>
              <span className="block text-xs text-gray-400">{PAYMENT_MODE_INFO[mode].description}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* El label cambia según la modalidad elegida: es UI derivada del estado */}
      <Field label={PAYMENT_MODE_INFO[form.paymentMode].dayLabel} error={errors.debitDay}>
        <input name="debitDay" type="number" min="1" max="31" value={form.debitDay} onChange={handleChange} className={inputClass} placeholder="1 a 31" />
      </Field>

      <Field label="Categoría" error={errors.categoryId}>
        <select name="categoryId" value={form.categoryId} onChange={handleChange} className={inputClass} disabled={categories.loading}>
          <option value="">{categories.loading ? 'Cargando...' : 'Elegí una categoría'}</option>
          {categories.items.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </Field>

      <Field label="Medio de pago" error={errors.paymentMethodId} className="sm:col-span-2">
        <select name="paymentMethodId" value={form.paymentMethodId} onChange={handleChange} className={inputClass} disabled={paymentMethods.loading}>
          <option value="">{paymentMethods.loading ? 'Cargando...' : 'Elegí un medio de pago'}</option>
          {paymentMethods.items.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </Field>

      <p className="sm:col-span-2 -mt-2 text-xs text-gray-500">
        ¿Falta alguna opción? Agregala en <Link to="/configuracion" className="text-blue-400 hover:underline">Configuración</Link>.
      </p>

      <Field label="Desde" error={errors.startPeriod}>
        <input name="startPeriod" type="month" value={form.startPeriod} onChange={handleChange} className={inputClass} />
      </Field>

      <Field label="Hasta (opcional)" error={errors.endPeriod}>
        <input name="endPeriod" type="month" value={form.endPeriod} onChange={handleChange} className={inputClass} />
      </Field>

      <label className="sm:col-span-2 flex items-center gap-2 text-sm text-gray-300">
        <input name="active" type="checkbox" checked={form.active} onChange={handleChange} className="h-4 w-4 accent-blue-600" />
        Gasto activo
        <span className="text-gray-500">(si lo desactivás, no genera cargos mensuales)</span>
      </label>

      {apiError && (
        <p className="sm:col-span-2 rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">{apiError}</p>
      )}

      <div className="sm:col-span-2 flex gap-3 justify-end">
        <Link to="/gastos" className="rounded-lg border border-gray-700 px-4 py-2 text-sm hover:bg-gray-800">
          Cancelar
        </Link>
        <button type="submit" disabled={submitting} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50">
          {submitting ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

// Envoltorio de cada campo: label arriba, input en el medio, error abajo.
// children es lo que va entre <Field> y </Field>
function Field({ label, error, hint, className = '', children }: {
  label: string
  error?: string
  hint?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-sm text-gray-300">{label}</span>
      {children}
      {hint && <span className="text-xs text-gray-500">{hint}</span>}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </label>
  )
}
