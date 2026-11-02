import type { Currency } from '../types'

export function formatMoney(amount: number, currency: Currency) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(amount)
}
// "2026-10" -> "oct 2026"
export function formatPeriod(period: string) {
  const [y, m] = period.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })
}

// "octubre de 2026" -> "Octubre de 2026" (la clase CSS capitalize pondría "Octubre De 2026")
export function capitalizeFirst(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
