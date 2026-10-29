// Fechas "de calendario" (sin hora): se trabajan en hora local para no correrse un día por la zona horaria

// "2026-10-10" -> Date local a las 00:00
export function parseDate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Date -> "2026-10-10"
export function toIsoDate(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${m}-${d}`
}

export function todayIso(): string {
  return toIsoDate(new Date())
}

// Días desde hoy hasta la fecha (negativo = ya pasó)
export function daysFromToday(iso: string): number {
  const today = parseDate(todayIso())
  return Math.round((parseDate(iso).getTime() - today.getTime()) / 86_400_000)
}

export function currentPeriod(): string {
  return todayIso().slice(0, 7)
}

export function addMonths(period: string, months: number): string {
  const [y, m] = period.split('-').map(Number)
  const d = new Date(y, m - 1 + months, 1)
  return toIsoDate(d).slice(0, 7)
}

// "2026-10" -> "octubre de 2026"
export function formatPeriodLong(period: string): string {
  const [y, m] = period.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
}

// "2026-10-10" -> "10/10"
export function formatShortDate(iso: string): string {
  return parseDate(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
}

// "2026-10-10" -> "sáb"
export function formatWeekday(iso: string): string {
  return parseDate(iso).toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', '')
}
