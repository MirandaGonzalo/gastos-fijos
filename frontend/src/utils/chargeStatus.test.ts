import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getChargeStatus } from './chargeStatus'
import { makeCharge } from '../test/factories'

describe('getChargeStatus', () => {
  // Los estados dependen de "hoy": congelamos la fecha en el 26/10/2026
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 26, 12, 0))
  })
  afterEach(() => vi.useRealTimers())

  it('un cargo pagado va a "Pagados"', () => {
    const status = getChargeStatus(makeCharge({ status: 'PAID', paidAt: '2026-10-08T12:00:00.000Z' }))
    expect(status.group).toBe('paid')
    expect(status.tone).toBe('green')
    expect(status.label).toMatch(/^Pagado el/)
  })

  describe('pago manual (la fecha es el vencimiento)', () => {
    const manual = (dueDate: string) => makeCharge({ dueDate, expense: { paymentMode: 'MANUAL' } })

    it('vencido: rojo y requiere atención', () => {
      expect(getChargeStatus(manual('2026-10-20'))).toEqual({
        label: 'Vencido hace 6 días',
        tone: 'red',
        group: 'attention',
      })
    })

    it('vence hoy: rojo', () => {
      expect(getChargeStatus(manual('2026-10-26'))).toMatchObject({ label: 'Vence hoy', tone: 'red' })
    })

    it('vence en 3 días o menos: ámbar y requiere atención', () => {
      expect(getChargeStatus(manual('2026-10-27'))).toEqual({
        label: 'Vence en 1 día',
        tone: 'amber',
        group: 'attention',
      })
    })

    it('con más margen: va a "Próximos"', () => {
      expect(getChargeStatus(manual('2026-11-05'))).toEqual({
        label: 'Vence en 10 días',
        tone: 'gray',
        group: 'upcoming',
      })
    })
  })

  describe('débito automático (la fecha es cuándo se debita)', () => {
    const automatic = (dueDate: string) => makeCharge({ dueDate, expense: { paymentMode: 'AUTOMATIC' } })

    it('fecha pasada sin confirmar: pide confirmación', () => {
      expect(getChargeStatus(automatic('2026-10-10'))).toEqual({
        label: '¿Se debitó? Confirmalo',
        tone: 'amber',
        group: 'attention',
      })
    })

    it('se debita hoy', () => {
      expect(getChargeStatus(automatic('2026-10-26')).label).toBe('Se debita hoy')
    })

    it('se debita pronto: azul y en "Próximos"', () => {
      expect(getChargeStatus(automatic('2026-10-28'))).toEqual({
        label: 'Se debita en 2 días',
        tone: 'blue',
        group: 'upcoming',
      })
    })
  })
})
