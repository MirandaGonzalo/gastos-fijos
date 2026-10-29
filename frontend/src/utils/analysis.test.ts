import { describe, expect, it } from 'vitest'
import { buildAnalysis, periodsInRange } from './analysis'
import { makeCharge } from '../test/factories'

const paid = (id: number, name: string, category: string, period: string, amount: number) =>
  makeCharge({
    id: Number(`${id}${period.replace('-', '')}`),
    period,
    status: 'PAID',
    amount,
    amountArs: amount,
    expense: { id, name, category: { id, name: category } },
  })

describe('periodsInRange', () => {
  it('incluye ambos extremos y cruza de año', () => {
    expect(periodsInRange('2026-11', '2027-01')).toEqual(['2026-11', '2026-12', '2027-01'])
  })
})

describe('buildAnalysis', () => {
  const periods = ['2026-08', '2026-09', '2026-10']
  const charges = [
    paid(1, 'Luz', 'Servicios', '2026-08', 79420),
    paid(1, 'Luz', 'Servicios', '2026-09', 95991),
    paid(1, 'Luz', 'Servicios', '2026-10', 85457),
    paid(2, 'Osde', 'Salud', '2026-09', 50712),
    paid(2, 'Osde', 'Salud', '2026-10', 51713),
    // Un pendiente: no es un monto real, no tiene que contar
    makeCharge({ id: 99, period: '2026-10', amount: 24000, amountArs: 24000, expense: { id: 3, name: 'Disney+' } }),
  ]

  const a = buildAnalysis(charges, periods)

  it('suma solo lo pagado', () => {
    expect(a.total).toBe(79420 + 95991 + 85457 + 50712 + 51713)
    expect(a.monthsWithPayments).toBe(3)
    expect(a.average).toBeCloseTo(a.total / 3)
  })

  it('arma una fila por mes con el total de cada categoría', () => {
    expect(a.categories).toEqual(['Salud', 'Servicios']) // orden alfabético, estable
    expect(a.months[0]).toMatchObject({ period: '2026-08', Servicios: 79420, Salud: 0, total: 79420 })
    expect(a.months[2]).toMatchObject({ period: '2026-10', Servicios: 85457, Salud: 51713 })
  })

  it('calcula la variación de cada gasto entre su primer y último pago', () => {
    const luz = a.variations.find((v) => v.name === 'Luz')!
    expect(luz.change).toBeCloseTo(85457 / 79420 - 1) // +7,6%
    expect(luz.monthlyChange).toBeCloseTo(Math.sqrt(85457 / 79420) - 1) // compuesta en 2 meses
    expect(luz.payments).toBe(3)
  })

  it('detecta el que más subió', () => {
    expect(a.topRiser?.name).toBe('Luz')
  })

  it('un gasto con un solo pago no tiene variación', () => {
    const only = buildAnalysis([paid(1, 'Luz', 'Servicios', '2026-10', 1000)], ['2026-10'])
    expect(only.variations[0].change).toBeNull()
    expect(only.topRiser).toBeNull()
  })

  it('cuenta los pagos en USD sin cotización y no los suma', () => {
    const usd = makeCharge({ status: 'PAID', amount: 20, amountArs: null, expense: { currency: 'USD' } })
    const r = buildAnalysis([usd], ['2026-10'])
    expect(r.missingRate).toBe(1)
    expect(r.total).toBe(0)
  })
})
