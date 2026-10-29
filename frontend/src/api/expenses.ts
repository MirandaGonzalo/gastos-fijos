import type { FixedExpense } from '../types'
import { apiFetch } from './client'

// Lo que se manda al crear: sin id, y con endPeriod/active opcionales
export type CreateExpenseInput = Omit<FixedExpense, 'id' | 'endPeriod' | 'active' | 'category' | 'paymentMethod' | 'paidCount'> & {
  categoryId: number
  paymentMethodId: number
  endPeriod?: string
  active?: boolean
}

export function getExpenses(signal?: AbortSignal) {
  return apiFetch<FixedExpense[]>('/expenses', { signal })
}

export function createExpense(data: CreateExpenseInput) {
  return apiFetch<FixedExpense>('/expenses', { method: 'POST', body: JSON.stringify(data) })
}

export function getExpense(id: number, signal?: AbortSignal) {
  return apiFetch<FixedExpense>(`/expenses/${id}`, { signal })
}

// Al editar, endPeriod puede ser null para quitar la fecha de fin
export type UpdateExpenseInput = Partial<Omit<CreateExpenseInput, 'endPeriod'>> & { endPeriod?: string | null }

export function updateExpense(id: number, data: UpdateExpenseInput) {
  return apiFetch<FixedExpense>(`/expenses/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export function deleteExpense(id: number) {
  return apiFetch<void>(`/expenses/${id}`, { method: 'DELETE' })
}
