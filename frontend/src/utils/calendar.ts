import { toIsoDate } from './dates'

export type CalendarDay = {
  date: string     // "2026-10-10"
  day: number      // 10
  inMonth: boolean // false para los días de relleno del mes anterior/siguiente
}

// Arma la grilla del mes: semanas completas de lunes a domingo
export function buildMonthGrid(period: string): CalendarDay[] {
  const [y, m] = period.split('-').map(Number)
  const first = new Date(y, m - 1, 1)
  const daysInMonth = new Date(y, m, 0).getDate()

  // getDay(): 0 = domingo. Lo pasamos a 0 = lunes
  const offset = (first.getDay() + 6) % 7
  const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7

  return Array.from({ length: totalCells }, (_, i) => {
    const date = new Date(y, m - 1, 1 - offset + i)
    return { date: toIsoDate(date), day: date.getDate(), inMonth: date.getMonth() === m - 1 }
  })
}

export const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
