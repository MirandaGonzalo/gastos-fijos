import type { MonthlyCharge } from '../types'
import { addMonths, daysFromToday } from './dates'
import { chargeToArs } from './stats'

// Todo lo que muestra el inicio, calculado a partir de los cargos del mes anterior, el actual y el siguiente.
// Es una función pura: no sabe nada de React, se puede testear sola
export function buildHomeSummary(charges: MonthlyCharge[], now: string, rate: number | null) {
  const prev = addMonths(now, -1)
  const byDate = (a: MonthlyCharge, b: MonthlyCharge) => a.dueDate.localeCompare(b.dueDate)

  const current = charges.filter((c) => c.period === now)
  const previous = charges.filter((c) => c.period === prev)
  const pending = charges.filter((c) => c.status === 'PENDING')

  // Lo que ya pasó y sigue pendiente: vencidos o débitos sin confirmar
  const overdue = pending.filter((c) => daysFromToday(c.dueDate) < 0).sort(byDate)

  // Lo que viene, de hoy en adelante
  const upcoming = pending.filter((c) => daysFromToday(c.dueDate) >= 0).sort(byDate)
  const next = upcoming[0] ?? null
  const nextWeek = upcoming.filter((c) => daysFromToday(c.dueDate) <= 7)

  // El mes actual en pesos
  const sum = (list: MonthlyCharge[]) => list.reduce((acc, c) => acc + chargeToArs(c, rate), 0)
  const currentPaid = current.filter((c) => c.status === 'PAID')
  const currentPending = current.filter((c) => c.status === 'PENDING')

  const month = {
    total: sum(current),
    paid: sum(currentPaid),
    pending: sum(currentPending),
    paidCount: currentPaid.length,
    count: current.length,
    // Lo que falta, en la moneda original: cuántos pesos y cuántos dólares necesitás
    pendingArs: currentPending.filter((c) => c.expense.currency === 'ARS').reduce((a, c) => a + c.amount, 0),
    pendingUsd: currentPending.filter((c) => c.expense.currency === 'USD').reduce((a, c) => a + c.amount, 0),
  }

  // Este mes, por unidad (prorrateado: un gasto 50/50 suma la mitad a cada una). Sin unidad -> "General"
  const unitTotals = new Map<string, { total: number; paid: number }>()
  for (const c of current) {
    const value = chargeToArs(c, rate)
    const parts = c.expense.units.length === 0
      ? [{ name: 'General', share: 100 }]
      : c.expense.units.map((u) => ({ name: u.name, share: u.share }))
    for (const p of parts) {
      const t = unitTotals.get(p.name) ?? { total: 0, paid: 0 }
      t.total += (value * p.share) / 100
      if (c.status === 'PAID') t.paid += (value * p.share) / 100
      unitTotals.set(p.name, t)
    }
  }
  const hasUnits = current.some((c) => c.expense.units.length > 0)
  // Ordenadas por nombre, con "General" al final
  const byUnit = hasUnits
    ? [...unitTotals]
        .map(([name, t]) => ({ name, ...t }))
        .sort((a, b) => (a.name === 'General' ? 1 : b.name === 'General' ? -1 : a.name.localeCompare(b.name, 'es')))
    : []

  const previousTotal = previous.length > 0 ? sum(previous) : null
  const change = previousTotal ? (month.total - previousTotal) / previousTotal : null

  return { next, nextWeek, overdue, month, previousTotal, change, byUnit }
}

// 0 -> "hoy", 1 -> "mañana", 5 -> "en 5 días"
export function relativeDays(diff: number): string {
  if (diff === 0) return 'hoy'
  if (diff === 1) return 'mañana'
  return `en ${diff} días`
}
