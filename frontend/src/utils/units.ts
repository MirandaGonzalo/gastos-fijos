import type { ExpenseUnit, FixedExpense, MonthlyCharge, UnitType } from '../types'
import { toArs, type Slice } from './stats'

export const UNIT_TYPE_LABEL: Record<UnitType, string> = {
  PROPERTY: 'Propiedad',
  VEHICLE: 'Vehículo',
  OTHER: 'Otro',
}

// Filtro por unidad: todas, solo los gastos sin unidad, o una unidad puntual (por id)
export type UnitFilter = 'all' | 'general' | number

export function parseUnitFilter(value: string | null): UnitFilter {
  if (value === 'general') return 'general'
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : 'all'
}

export function unitFilterToParam(filter: UnitFilter): string | null {
  return filter === 'all' ? null : String(filter)
}

// Qué parte del gasto le corresponde al filtro: 1 = todo, 0.5 = la mitad, 0 = nada
export function shareFor(units: ExpenseUnit[], filter: UnitFilter): number {
  if (filter === 'all') return 1
  if (filter === 'general') return units.length === 0 ? 1 : 0
  return (units.find((u) => u.id === filter)?.share ?? 0) / 100
}

// Cargos de una unidad, con los montos prorrateados según su porcentaje.
// Ej.: Disney+ $24.000 repartido 50/50 -> para el depto cuenta $12.000
export function prorateCharges(charges: MonthlyCharge[], filter: UnitFilter): MonthlyCharge[] {
  if (filter === 'all') return charges
  return charges.flatMap((c) => {
    const share = shareFor(c.expense.units, filter)
    if (share === 0) return []
    return [{ ...c, amount: c.amount * share, amountArs: c.amountArs === null ? null : c.amountArs * share }]
  })
}

// Lo mismo para los gastos (monto estimado)
export function prorateExpenses(expenses: FixedExpense[], filter: UnitFilter): FixedExpense[] {
  if (filter === 'all') return expenses
  return expenses.flatMap((e) => {
    const share = shareFor(e.units, filter)
    return share === 0 ? [] : [{ ...e, estimatedAmount: e.estimatedAmount * share }]
  })
}

// Reparte 100% en partes iguales con 2 decimales; el último absorbe el redondeo (3 -> 33.33, 33.33, 33.34)
export function splitEvenly(count: number): number[] {
  if (count <= 0) return []
  const base = Math.floor((100 / count) * 100) / 100
  const shares = Array.from({ length: count }, () => base)
  shares[count - 1] = Math.round((100 - base * (count - 1)) * 100) / 100
  return shares
}

// Cuánto le corresponde a cada unidad por mes (monto estimado, en pesos, prorrateado).
// Los gastos sin unidad suman en "General"
export function totalsByUnit(expenses: FixedExpense[], rate: number | null): Slice[] {
  const totals = new Map<string, number>()
  for (const e of expenses) {
    if (!e.active) continue
    const value = toArs(e, rate)
    if (e.units.length === 0) totals.set('General', (totals.get('General') ?? 0) + value)
    for (const u of e.units) totals.set(u.name, (totals.get(u.name) ?? 0) + (value * u.share) / 100)
  }
  return [...totals].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
}
