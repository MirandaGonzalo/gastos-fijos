import type { MonthlyCharge } from '../types'
import { apiFetch } from './client'

export type UpdateChargeInput = {
  amount?: number
  exchangeRate?: number // solo USD
  paid?: boolean
  paidAt?: string // YYYY-MM-DD
}

// Trae (y genera si faltan) los cargos de un rango de meses
export function getCharges(from: string, to: string = from, signal?: AbortSignal) {
  return apiFetch<MonthlyCharge[]>(`/charges?from=${from}&to=${to}`, { signal })
}

export function updateCharge(id: number, data: UpdateChargeInput) {
  return apiFetch<MonthlyCharge>(`/charges/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}
