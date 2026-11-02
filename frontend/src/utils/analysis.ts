import type { MonthlyCharge } from '../types'
import { addMonths } from './dates'

// Análisis sobre lo que REALMENTE pagaste: solo cargos pagados y con costo en pesos conocido.
// Función pura: recibe cargos y meses, devuelve números. No sabe nada de React.

const MAX_GROUPS = 6 // más que esto se agrupa en "Otros"

// Cómo se arman las barras de cada mes: por categoría o por unidad
export type GroupBy = 'category' | 'unit'

export type ExpenseVariation = {
  id: number
  name: string
  units: string[]              // nombres de sus unidades (vacío = general)
  currency: 'ARS' | 'USD'
  first: { period: string; amount: number }
  last: { period: string; amount: number }
  change: number | null        // variación total (0.25 = +25%); null si hay un solo pago
  monthlyChange: number | null // variación promedio por mes (compuesta)
  total: number
  payments: number
}

// Meses entre dos períodos "YYYY-MM"
function monthsBetween(from: string, to: string): number {
  const [y1, m1] = from.split('-').map(Number)
  const [y2, m2] = to.split('-').map(Number)
  return (y2 - y1) * 12 + (m2 - m1)
}

export function periodsInRange(from: string, to: string): string[] {
  const result: string[] = []
  for (let p = from; p <= to; p = addMonths(p, 1)) result.push(p)
  return result
}

export function buildAnalysis(charges: MonthlyCharge[], periods: string[], groupBy: GroupBy = 'category') {
  const paid = charges.filter((c) => c.status === 'PAID' && c.amountArs !== null)
  const missingRate = charges.filter((c) => c.status === 'PAID' && c.amountArs === null).length
  const ars = (c: MonthlyCharge) => c.amountArs ?? 0

  // ── Totales ───────────────────────────────────────────────────────────────
  const total = paid.reduce((acc, c) => acc + ars(c), 0)
  const monthsWithPayments = new Set(paid.map((c) => c.period)).size
  const average = monthsWithPayments > 0 ? total / monthsWithPayments : 0

  // ── Cada pago, asignado a su grupo. Por unidad, un gasto compartido se reparte
  //    según su porcentaje (Disney+ 50/50 -> mitad a cada unidad); sin unidad va a "General" ──
  const entries = paid.flatMap((c) => {
    if (groupBy === 'category') return [{ period: c.period, group: c.expense.category.name, value: ars(c) }]
    if (c.expense.units.length === 0) return [{ period: c.period, group: 'General', value: ars(c) }]
    return c.expense.units.map((u) => ({ period: c.period, group: u.name, value: (ars(c) * u.share) / 100 }))
  })

  // ── Grupos: orden fijo (alfabético) para que cada uno conserve su color ──
  const groupTotals = new Map<string, number>()
  for (const e of entries) groupTotals.set(e.group, (groupTotals.get(e.group) ?? 0) + e.value)
  const byTotal = [...groupTotals.entries()].sort((a, b) => b[1] - a[1]).map(([n]) => n)
  const kept = new Set(byTotal.slice(0, byTotal.length > MAX_GROUPS ? MAX_GROUPS - 1 : MAX_GROUPS))
  const groupOf = (name: string) => (kept.has(name) ? name : 'Otros')
  const groups = [...kept].sort((a, b) => a.localeCompare(b, 'es'))
  if (byTotal.length > MAX_GROUPS) groups.push('Otros')

  // ── Una fila por mes, con el total de cada grupo (para las barras apiladas) ──
  const months = periods.map((period) => {
    const row: Record<string, number | string> & { period: string; total: number } = { period, total: 0 }
    for (const g of groups) row[g] = 0
    for (const e of entries.filter((x) => x.period === period)) {
      const g = groupOf(e.group)
      row[g] = (row[g] as number) + e.value
      row.total += e.value
    }
    return row
  })

  // ── Variación de cada gasto entre su primer y su último pago del período ──
  const byExpense = new Map<number, MonthlyCharge[]>()
  for (const c of paid) byExpense.set(c.expense.id, [...(byExpense.get(c.expense.id) ?? []), c])

  const variations: ExpenseVariation[] = [...byExpense.values()].map((list) => {
    const sorted = [...list].sort((a, b) => a.period.localeCompare(b.period))
    const first = sorted[0]
    const last = sorted[sorted.length - 1]
    const span = monthsBetween(first.period, last.period)
    const change = span > 0 && ars(first) > 0 ? ars(last) / ars(first) - 1 : null
    const monthlyChange = change !== null ? Math.pow(1 + change, 1 / span) - 1 : null
    return {
      id: first.expense.id,
      name: first.expense.name,
      units: first.expense.units.map((u) => u.name),
      currency: first.expense.currency,
      first: { period: first.period, amount: ars(first) },
      last: { period: last.period, amount: ars(last) },
      change,
      monthlyChange,
      total: sorted.reduce((acc, c) => acc + ars(c), 0),
      payments: sorted.length,
    }
  })

  const withChange = variations.filter((v) => v.change !== null)
  const averageChange =
    withChange.length > 0 ? withChange.reduce((acc, v) => acc + (v.change ?? 0), 0) / withChange.length : null
  const topRiser = withChange.length > 0 ? withChange.reduce((a, b) => ((b.change ?? 0) > (a.change ?? 0) ? b : a)) : null

  return { total, average, monthsWithPayments, averageChange, topRiser, groups, months, variations, missingRate }
}
