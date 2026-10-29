import {
  PERIOD_REGEX,
  addMonths,
  currentPeriod,
  dueDateFor,
  periodsBetween,
} from './period';

describe('period utils', () => {
  describe('PERIOD_REGEX', () => {
    it.each(['2026-01', '2026-10', '2026-12'])('acepta %s', (p) => {
      expect(PERIOD_REGEX.test(p)).toBe(true);
    });

    it.each(['2026-13', '2026-00', '2026-1', '26-10', '2026/10'])(
      'rechaza %s',
      (p) => {
        expect(PERIOD_REGEX.test(p)).toBe(false);
      },
    );
  });

  describe('currentPeriod', () => {
    it('formatea la fecha como YYYY-MM', () => {
      expect(currentPeriod(new Date(2026, 0, 15))).toBe('2026-01');
      expect(currentPeriod(new Date(2026, 9, 31))).toBe('2026-10');
    });
  });

  describe('addMonths', () => {
    it('suma y resta meses', () => {
      expect(addMonths('2026-10', 1)).toBe('2026-11');
      expect(addMonths('2026-10', -3)).toBe('2026-07');
    });

    it('cruza de año en los dos sentidos', () => {
      expect(addMonths('2026-12', 1)).toBe('2027-01');
      expect(addMonths('2026-01', -1)).toBe('2025-12');
      expect(addMonths('2026-10', 15)).toBe('2028-01');
    });
  });

  describe('periodsBetween', () => {
    it('incluye los dos extremos', () => {
      expect(periodsBetween('2026-11', '2027-02')).toEqual([
        '2026-11',
        '2026-12',
        '2027-01',
        '2027-02',
      ]);
    });

    it('devuelve un solo mes si from === to', () => {
      expect(periodsBetween('2026-10', '2026-10')).toEqual(['2026-10']);
    });

    it('devuelve vacío si to es anterior a from', () => {
      expect(periodsBetween('2026-10', '2026-09')).toEqual([]);
    });
  });

  describe('dueDateFor', () => {
    const iso = (d: Date) => d.toISOString().slice(0, 10);

    it('usa el día de débito del mes', () => {
      expect(iso(dueDateFor('2026-10', 10))).toBe('2026-10-10');
    });

    it('si el día no existe en el mes, usa el último', () => {
      expect(iso(dueDateFor('2026-02', 31))).toBe('2026-02-28');
      expect(iso(dueDateFor('2026-11', 31))).toBe('2026-11-30');
    });

    it('respeta los años bisiestos', () => {
      expect(iso(dueDateFor('2028-02', 30))).toBe('2028-02-29');
    });
  });
});
