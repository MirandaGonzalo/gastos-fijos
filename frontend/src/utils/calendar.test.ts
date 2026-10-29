import { describe, expect, it } from 'vitest'
import { buildMonthGrid } from './calendar'

describe('buildMonthGrid', () => {
  it('octubre 2026 empieza en jueves: 3 días de relleno de septiembre', () => {
    const grid = buildMonthGrid('2026-10')
    expect(grid).toHaveLength(35)
    expect(grid[0]).toEqual({ date: '2026-09-28', day: 28, inMonth: false })
    expect(grid[3]).toEqual({ date: '2026-10-01', day: 1, inMonth: true })
    expect(grid.filter((d) => d.inMonth)).toHaveLength(31)
  })

  it('siempre son semanas completas de lunes a domingo', () => {
    for (const period of ['2026-01', '2026-02', '2026-06', '2026-11', '2027-03']) {
      expect(buildMonthGrid(period).length % 7).toBe(0)
    }
  })

  it('febrero 2027 empieza en lunes y entra justo en 4 semanas', () => {
    const grid = buildMonthGrid('2027-02')
    expect(grid).toHaveLength(28)
    expect(grid.every((d) => d.inMonth)).toBe(true)
  })

  it('noviembre 2026 empieza en domingo: necesita 6 semanas', () => {
    const grid = buildMonthGrid('2026-11')
    expect(grid).toHaveLength(42)
    expect(grid[6]).toMatchObject({ date: '2026-11-01', inMonth: true })
  })
})
