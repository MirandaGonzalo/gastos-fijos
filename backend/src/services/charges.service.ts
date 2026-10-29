import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ChargeResponseDto } from '../dto/charge-response.dto';
import { UpdateChargeDto } from '../dto/update-charge.dto';
import { prismaErrorCode } from '../utils/prisma-errors';
import { currentPeriod, dueDateFor, periodsBetween } from '../utils/period';

const MAX_MONTHS = 24;

// Datos del gasto que viajan con cada cargo
const chargeInclude = {
  expense: {
    select: {
      id: true,
      name: true,
      currency: true,
      paymentMode: true,
      debitDay: true,
      category: { select: { id: true, name: true } },
      paymentMethod: { select: { id: true, name: true } },
    },
  },
} as const;

type ChargeWithExpense = {
  id: number;
  period: string;
  dueDate: Date;
  amount: { toNumber(): number };
  exchangeRate: { toNumber(): number } | null;
  status: 'PENDING' | 'PAID';
  paidAt: Date | null;
  expense: ChargeResponseDto['expense'];
};

function toResponse(c: ChargeWithExpense): ChargeResponseDto {
  const amount = c.amount.toNumber();
  const exchangeRate = c.exchangeRate ? c.exchangeRate.toNumber() : null;
  const amountArs =
    c.expense.currency === 'ARS'
      ? amount
      : exchangeRate
        ? Math.round(amount * exchangeRate * 100) / 100
        : null;
  return {
    id: c.id,
    period: c.period,
    dueDate: c.dueDate.toISOString().slice(0, 10),
    amount,
    exchangeRate,
    amountArs,
    status: c.status,
    paidAt: c.paidAt,
    expense: c.expense,
  };
}

@Injectable()
export class ChargesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByRange(from?: string, to?: string): Promise<ChargeResponseDto[]> {
    const start = from ?? currentPeriod();
    const end = to ?? start;
    if (end < start)
      throw new BadRequestException('to no puede ser anterior a from');

    const periods = periodsBetween(start, end);
    if (periods.length > MAX_MONTHS) {
      throw new BadRequestException(
        `El rango no puede superar ${MAX_MONTHS} meses`,
      );
    }

    await this.ensureCharges(periods);

    const charges = await this.prisma.monthlyCharge.findMany({
      where: { period: { gte: start, lte: end } },
      include: chargeInclude,
      orderBy: [{ dueDate: 'asc' }, { id: 'asc' }],
    });

    return charges.map(toResponse);
  }

  // Pagar, deshacer el pago o ajustar el monto real de un cargo
  async update(id: number, dto: UpdateChargeDto): Promise<ChargeResponseDto> {
    const current = await this.prisma.monthlyCharge.findUnique({
      where: { id },
      select: { expense: { select: { currency: true } } },
    });
    if (!current) throw new NotFoundException('El cargo no existe');

    const data: {
      amount?: number;
      exchangeRate?: number | null;
      status?: 'PAID' | 'PENDING';
      paidAt?: Date | null;
    } = {};

    if (dto.amount !== undefined) data.amount = dto.amount;

    if (dto.exchangeRate !== undefined) {
      if (current.expense.currency !== 'USD') {
        throw new BadRequestException(
          'La cotización solo aplica a cargos en USD',
        );
      }
      data.exchangeRate = dto.exchangeRate;
    }

    if (dto.paid === true) {
      data.status = 'PAID';
      data.paidAt = dto.paidAt
        ? new Date(`${dto.paidAt}T12:00:00Z`)
        : new Date();
    } else if (dto.paid === false) {
      data.status = 'PENDING';
      data.paidAt = null;
      data.exchangeRate = null; // la cotización era la del pago que se deshace
    } else if (dto.paidAt) {
      data.paidAt = new Date(`${dto.paidAt}T12:00:00Z`); // corregir solo la fecha de pago
    }

    try {
      const charge = await this.prisma.monthlyCharge.update({
        where: { id },
        data,
        include: chargeInclude,
      });
      return toResponse(charge);
    } catch (err) {
      if (prismaErrorCode(err) === 'P2025') {
        throw new NotFoundException('El cargo no existe');
      }
      throw err;
    }
  }

  // Generación "lazy": crea los cargos que falten para los meses pedidos,
  // usando el monto estimado. Los que ya existen no se tocan (skipDuplicates)
  private async ensureCharges(periods: string[]) {
    const from = periods[0];
    const to = periods[periods.length - 1];

    const expenses = await this.prisma.fixedExpense.findMany({
      where: {
        active: true,
        startPeriod: { lte: to },
        OR: [{ endPeriod: null }, { endPeriod: { gte: from } }],
      },
    });

    const data = expenses.flatMap((e) =>
      periods
        .filter((p) => p >= e.startPeriod && (!e.endPeriod || p <= e.endPeriod))
        .map((p) => ({
          expenseId: e.id,
          period: p,
          dueDate: dueDateFor(p, e.debitDay),
          amount: e.estimatedAmount,
        })),
    );

    if (data.length > 0) {
      await this.prisma.monthlyCharge.createMany({
        data,
        skipDuplicates: true,
      });
    }
  }
}
