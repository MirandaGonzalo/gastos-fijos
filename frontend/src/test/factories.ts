import type { MonthlyCharge } from '../types'

// Arma un cargo de prueba con valores por defecto: cada test cambia solo lo que le importa
export function makeCharge(
  overrides: Omit<Partial<MonthlyCharge>, 'expense'> & { expense?: Partial<MonthlyCharge['expense']> } = {},
): MonthlyCharge {
  const { expense, ...rest } = overrides
  return {
    id: 1,
    period: '2026-10',
    dueDate: '2026-10-10',
    amount: 10000,
    exchangeRate: null,
    amountArs: 10000,
    status: 'PENDING',
    paidAt: null,
    ...rest,
    expense: {
      id: 1,
      name: 'Luz',
      currency: 'ARS',
      paymentMode: 'MANUAL',
      debitDay: 10,
      category: { id: 1, name: 'Servicios' },
      paymentMethod: { id: 1, name: 'Visa' },
      ...expense,
    },
  }
}
