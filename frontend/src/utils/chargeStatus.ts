import type { MonthlyCharge } from '../types'
import { daysFromToday, formatShortDate } from './dates'

export type ChargeGroup = 'attention' | 'upcoming' | 'paid'
export type Tone = 'red' | 'amber' | 'blue' | 'gray' | 'green'

export type ChargeStatusInfo = {
  label: string
  tone: Tone
  group: ChargeGroup
}

function days(n: number) {
  return n === 1 ? '1 día' : `${n} días`
}

// Toda la lógica de "en qué estado está un cargo" en una función pura:
// mismos datos de entrada -> misma salida. Fácil de testear.
export function getChargeStatus(charge: MonthlyCharge): ChargeStatusInfo {
  if (charge.status === 'PAID') {
    return {
      label: charge.paidAt ? `Pagado el ${formatShortDate(charge.paidAt)}` : 'Pagado',
      tone: 'green',
      group: 'paid',
    }
  }

  const diff = daysFromToday(charge.dueDate)

  if (charge.expense.paymentMode === 'AUTOMATIC') {
    if (diff < 0) return { label: '¿Se debitó? Confirmalo', tone: 'amber', group: 'attention' }
    if (diff === 0) return { label: 'Se debita hoy', tone: 'blue', group: 'attention' }
    return { label: `Se debita en ${days(diff)}`, tone: diff <= 3 ? 'blue' : 'gray', group: 'upcoming' }
  }

  // Pago manual: la fecha es el vencimiento
  if (diff < 0) return { label: `Vencido hace ${days(-diff)}`, tone: 'red', group: 'attention' }
  if (diff === 0) return { label: 'Vence hoy', tone: 'red', group: 'attention' }
  if (diff <= 3) return { label: `Vence en ${days(diff)}`, tone: 'amber', group: 'attention' }
  return { label: `Vence en ${days(diff)}`, tone: 'gray', group: 'upcoming' }
}

export const TONE_CLASSES: Record<Tone, string> = {
  red: 'bg-red-500/15 text-red-300',
  amber: 'bg-amber-500/15 text-amber-300',
  blue: 'bg-blue-500/15 text-blue-300',
  gray: 'bg-gray-500/15 text-gray-300',
  green: 'bg-emerald-500/15 text-emerald-300',
}
