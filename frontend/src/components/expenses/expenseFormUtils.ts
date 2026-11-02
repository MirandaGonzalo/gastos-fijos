import type { Currency, FixedExpense, PaymentMode } from '../../types'
import type { CreateExpenseInput } from '../../api/expenses'
import { currentPeriod } from '../../utils/dates'

// El estado del form guarda todo como string (así vienen de los inputs);
// se convierte a número recién al enviar
export type ExpenseFormValues = {
  name: string
  estimatedAmount: string
  currency: Currency
  paymentMode: PaymentMode
  debitDay: string
  categoryId: string     // los <select> también devuelven string
  paymentMethodId: string
  startPeriod: string
  endPeriod: string
  active: boolean        // el checkbox es el único campo booleano
  units: { unitId: number; share: string }[] // reparto entre unidades; vacío = gasto general
}

export type ExpenseFormErrors = Partial<Record<keyof ExpenseFormValues, string>>

export function emptyExpenseForm(): ExpenseFormValues {
  return {
    name: '',
    estimatedAmount: '',
    currency: 'ARS',
    paymentMode: 'AUTOMATIC',
    debitDay: '',
    categoryId: '',
    paymentMethodId: '',
    startPeriod: currentPeriod(),
    endPeriod: '',
    active: true,
    units: [],
  }
}

// Gasto que viene de la API -> valores del form (todo a string)
export function expenseToForm(e: FixedExpense): ExpenseFormValues {
  return {
    name: e.name,
    estimatedAmount: String(e.estimatedAmount),
    currency: e.currency,
    paymentMode: e.paymentMode,
    debitDay: String(e.debitDay),
    categoryId: String(e.category.id),
    paymentMethodId: String(e.paymentMethod.id),
    startPeriod: e.startPeriod,
    endPeriod: e.endPeriod ?? '',
    active: e.active,
    units: e.units.map((u) => ({ unitId: u.id, share: String(u.share) })),
  }
}

// Valores del form -> lo que espera la API (números y null donde corresponde)
export function formToInput(f: ExpenseFormValues): Omit<CreateExpenseInput, 'endPeriod'> & { endPeriod: string | null } {
  return {
    name: f.name.trim(),
    estimatedAmount: Number(f.estimatedAmount),
    currency: f.currency,
    paymentMode: f.paymentMode,
    debitDay: Number(f.debitDay),
    categoryId: Number(f.categoryId),
    paymentMethodId: Number(f.paymentMethodId),
    startPeriod: f.startPeriod,
    endPeriod: f.endPeriod || null, // null = sin fin (al editar, borra la fecha de fin)
    active: f.active,
    units: f.units.map((u) => ({ unitId: u.unitId, share: Number(u.share) })),
  }
}

// Validación del lado del front: feedback inmediato sin ir al back.
// El back valida igual: nunca confíes solo en el front
export function validateExpenseForm(f: ExpenseFormValues): ExpenseFormErrors {
  const errors: ExpenseFormErrors = {}
  if (!f.name.trim()) errors.name = 'Ingresá un nombre'
  const amount = Number(f.estimatedAmount)
  if (!f.estimatedAmount || Number.isNaN(amount) || amount <= 0) errors.estimatedAmount = 'Ingresá un monto mayor a 0'
  const day = Number(f.debitDay)
  if (!Number.isInteger(day) || day < 1 || day > 31) errors.debitDay = 'Tiene que ser un día entre 1 y 31'
  if (!f.categoryId) errors.categoryId = 'Elegí una categoría'
  if (!f.paymentMethodId) errors.paymentMethodId = 'Elegí un medio de pago'
  if (!f.startPeriod) errors.startPeriod = 'Elegí el mes de inicio'
  if (f.endPeriod && f.endPeriod < f.startPeriod) errors.endPeriod = 'No puede ser anterior al inicio'
  if (f.units.length > 0) {
    const shares = f.units.map((u) => Number(u.share))
    const total = shares.reduce((a, b) => a + b, 0)
    if (shares.some((v) => !(v > 0))) errors.units = 'Cada unidad tiene que tener un porcentaje mayor a 0'
    else if (Math.abs(total - 100) > 0.01) errors.units = `El reparto tiene que sumar 100% (ahora suma ${Math.round(total * 100) / 100}%)`
  }
  return errors
}
