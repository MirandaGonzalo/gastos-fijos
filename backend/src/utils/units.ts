import { BadRequestException } from '@nestjs/common';
import type { ExpenseUnitDto } from '../dto/create-expense.dto';
import type { ExpenseUnitResponseDto } from '../dto/unit.dto';

// Cómo traer las unidades de un gasto desde Prisma (share es Decimal)
export const expenseUnitsSelect = {
  select: {
    share: true,
    unit: { select: { id: true, name: true, type: true } },
  },
  orderBy: { unit: { name: 'asc' as const } },
};

type RawExpenseUnit = {
  share: { toNumber(): number };
  unit: Omit<ExpenseUnitResponseDto, 'share'>;
};

export function toExpenseUnits(
  raw: RawExpenseUnit[],
): ExpenseUnitResponseDto[] {
  return raw.map((u) => ({ ...u.unit, share: u.share.toNumber() }));
}

// El reparto tiene que sumar 100% y no repetir unidades. Vacío = gasto general
export function validateUnitShares(units: ExpenseUnitDto[]): void {
  if (units.length === 0) return;
  const ids = units.map((u) => u.unitId);
  if (new Set(ids).size !== ids.length) {
    throw new BadRequestException('Una unidad aparece más de una vez');
  }
  const total = units.reduce((acc, u) => acc + u.share, 0);
  if (Math.abs(total - 100) > 0.01) {
    throw new BadRequestException(
      `El reparto entre unidades tiene que sumar 100% (suma ${Math.round(total * 100) / 100}%)`,
    );
  }
}
