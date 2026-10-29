import type { Currency } from '../types'

export function formatMoney(amount: number, currency: Currency) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(amount)
}
// "2026-10" -> "oct 2026"
export function formatPeriod(period: string) {
  const [y, m] = period.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })
}
