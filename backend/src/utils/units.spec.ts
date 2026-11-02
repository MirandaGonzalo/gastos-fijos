import { BadRequestException } from '@nestjs/common';
import { toExpenseUnits, validateUnitShares } from './units';

describe('validateUnitShares', () => {
  it('sin unidades es válido (gasto general)', () => {
    expect(() => validateUnitShares([])).not.toThrow();
  });

  it('una unidad al 100% es válida', () => {
    expect(() => validateUnitShares([{ unitId: 1, share: 100 }])).not.toThrow();
  });

  it('un reparto que suma 100% es válido, aunque tenga decimales', () => {
    expect(() =>
      validateUnitShares([
        { unitId: 1, share: 33.33 },
        { unitId: 2, share: 33.33 },
        { unitId: 3, share: 33.34 },
      ]),
    ).not.toThrow();
  });

  it('rechaza un reparto que no suma 100%', () => {
    expect(() =>
      validateUnitShares([
        { unitId: 1, share: 50 },
        { unitId: 2, share: 40 },
      ]),
    ).toThrow(
      new BadRequestException(
        'El reparto entre unidades tiene que sumar 100% (suma 90%)',
      ),
    );
  });

  it('rechaza unidades repetidas', () => {
    expect(() =>
      validateUnitShares([
        { unitId: 1, share: 50 },
        { unitId: 1, share: 50 },
      ]),
    ).toThrow(BadRequestException);
  });
});

describe('toExpenseUnits', () => {
  it('aplana la relación y convierte el Decimal a number', () => {
    const raw = [
      {
        share: { toNumber: () => 50 },
        unit: { id: 2, name: 'Casa', type: 'PROPERTY' as const },
      },
    ];
    expect(toExpenseUnits(raw)).toEqual([
      { id: 2, name: 'Casa', type: 'PROPERTY', share: 50 },
    ]);
  });
});
