import { describe, expect, it } from 'vitest'
import { parseUnitFilter, prorateCharges, shareFor, splitEvenly } from './units'
import { makeCharge } from '../test/factories'
import type { ExpenseUnit } from '../types'

const depto: ExpenseUnit = { id: 1, name: 'Depto', type: 'PROPERTY', share: 50 }
const casa: ExpenseUnit = { id: 2, name: 'Casa', type: 'PROPERTY', share: 50 }

describe('splitEvenly', () => {
  it('reparte en partes iguales y siempre suma 100', () => {
    expect(splitEvenly(1)).toEqual([100])
    expect(splitEvenly(2)).toEqual([50, 50])
    expect(splitEvenly(3)).toEqual([33.33, 33.33, 33.34])
    expect(splitEvenly(7).reduce((a, b) => a + b, 0)).toBeCloseTo(100)
  })
})

describe('parseUnitFilter', () => {
  it('interpreta el parámetro de la URL', () => {
    expect(parseUnitFilter(null)).toBe('all')
    expect(parseUnitFilter('general')).toBe('general')
    expect(parseUnitFilter('3')).toBe(3)
    expect(parseUnitFilter('cualquier-cosa')).toBe('all')
  })
})

describe('shareFor', () => {
  it('todas: el gasto completo', () => {
    expect(shareFor([depto, casa], 'all')).toBe(1)
  })
  it('una unidad: su porcentaje', () => {
    expect(shareFor([depto, casa], 1)).toBe(0.5)
    expect(shareFor([depto, casa], 9)).toBe(0)
  })
  it('general: solo los gastos sin unidad', () => {
    expect(shareFor([], 'general')).toBe(1)
    expect(shareFor([depto], 'general')).toBe(0)
  })
})

describe('prorateCharges', () => {
  const disney = makeCharge({ id: 1, amount: 24000, amountArs: 24000, expense: { units: [depto, casa] } })
  const luz = makeCharge({ id: 2, amount: 80000, amountArs: 80000, expense: { units: [{ ...depto, share: 100 }] } })
  const prepaga = makeCharge({ id: 3, amount: 100000, amountArs: 100000, expense: { units: [] } })

  it('para una unidad, prorratea y descarta lo que no le corresponde', () => {
    const r = prorateCharges([disney, luz, prepaga], 1)
    expect(r.map((c) => c.amountArs)).toEqual([12000, 80000])
  })

  it('"general" deja solo los gastos sin unidad', () => {
    expect(prorateCharges([disney, luz, prepaga], 'general').map((c) => c.id)).toEqual([3])
  })

  it('"todas" no cambia nada', () => {
    expect(prorateCharges([disney, luz], 'all')).toEqual([disney, luz])
  })
})
