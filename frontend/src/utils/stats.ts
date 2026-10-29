import type { FixedExpense, MonthlyCharge } from '../types'

// Pasa el monto estimado a pesos. rate = pesos por dólar (null si no hay cotización: USD cuenta 0)
export function toArs(e: FixedExpense, rate: number | null) {
  return e.currency === 'USD' ? e.estimatedAmount * (rate ?? 0) : e.estimatedAmount
}

export type Slice = { name: string; value: number }

const MAX_SLICES = 6 // más que esto se agrupa en "Otros"

// Agrupa los gastos activos por un campo y suma los montos (en ARS)
export function totalsBy(expenses: FixedExpense[], key: 'category' | 'paymentMethod', rate: number | null): Slice[] {
  const totals = new Map<string, number>()
  for (const e of expenses) {
    if (!e.active) continue
    totals.set(e[key].name, (totals.get(e[key].name) ?? 0) + toArs(e, rate))
  }

  const sorted = [...totals]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  if (sorted.length <= MAX_SLICES) return sorted
  const rest = sorted.slice(MAX_SLICES - 1).reduce((sum, s) => sum + s.value, 0)
  return [...sorted.slice(0, MAX_SLICES - 1), { name: 'Otros', value: rest }]
}

// Total debitado por día del mes (solo los días que tienen débitos)
export function totalsByDay(expenses: FixedExpense[], rate: number | null) {
  const totals = new Map<number, number>()
  for (const e of expenses) {
    if (!e.active) continue
    totals.set(e.debitDay, (totals.get(e.debitDay) ?? 0) + toArs(e, rate))
  }
  return [...totals]
    .map(([day, value]) => ({ day: `Día ${day}`, dayNumber: day, value }))
    .sort((a, b) => a.dayNumber - b.dayNumber)
}

export type CategorySummary = { name: string; total: number; count: number }

// Resumen para "cuánto hay que pagar": total por categoría (en ARS) y totales por moneda original
export function monthlySummary(expenses: FixedExpense[], rate: number | null) {
  const active = expenses.filter((e) => e.active)

  const byCategory = new Map<string, CategorySummary>()
  for (const e of active) {
    const name = e.category.name
    const current = byCategory.get(name) ?? { name, total: 0, count: 0 }
    byCategory.set(name, { name, total: current.total + toArs(e, rate), count: current.count + 1 })
  }

  const sum = (currency: FixedExpense['currency']) =>
    active.filter((e) => e.currency === currency).reduce((acc, e) => acc + e.estimatedAmount, 0)

  const categories = [...byCategory.values()].sort((a, b) => b.total - a.total)

  return {
    categories,
    totalArs: categories.reduce((acc, c) => acc + c.total, 0), // todo convertido a pesos
    nativeArs: sum('ARS'),
    nativeUsd: sum('USD'),
    count: active.length,
  }
}

// Costo en pesos de un cargo: el real si ya se pagó con cotización; si no, estimado con la cotización actual
export function chargeToArs(c: MonthlyCharge, rate: number | null) {
  return c.amountArs ?? c.amount * (rate ?? 0)
}
