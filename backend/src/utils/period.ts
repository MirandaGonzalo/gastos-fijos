// Helpers para trabajar con períodos "YYYY-MM"

export const PERIOD_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

export function currentPeriod(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function addMonths(period: string, months: number): string {
  const [y, m] = period.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + months, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

// Lista de períodos entre from y to, inclusive
export function periodsBetween(from: string, to: string): string[] {
  const result: string[] = [];
  for (let p = from; p <= to; p = addMonths(p, 1)) result.push(p);
  return result;
}

// Fecha de débito del período; si el día no existe en el mes (ej. 31 en febrero), usa el último
export function dueDateFor(period: string, debitDay: number): Date {
  const [y, m] = period.split('-').map(Number);
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return new Date(Date.UTC(y, m - 1, Math.min(debitDay, lastDay)));
}
