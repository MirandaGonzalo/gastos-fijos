import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import { ExpenseResponseDto } from '../dto/expense-response.dto';
import { prismaErrorCode } from '../utils/prisma-errors';
import { currentPeriod, dueDateFor } from '../utils/period';

// Trae la categoría, el medio de pago y cuántos cargos pagados tiene (JOIN + COUNT)
const include = {
  category: { select: { id: true, name: true } },
  paymentMethod: { select: { id: true, name: true } },
  _count: { select: { charges: { where: { status: 'PAID' as const } } } },
};

type ExpenseWithRelations = {
  estimatedAmount: { toNumber(): number };
  _count: { charges: number };
};

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ExpenseResponseDto[]> {
    const expenses = await this.prisma.fixedExpense.findMany({
      include,
      orderBy: [{ debitDay: 'asc' }, { name: 'asc' }],
    });
    return expenses.map((e) => this.toResponse(e));
  }

  async findOne(id: number): Promise<ExpenseResponseDto> {
    const expense = await this.prisma.fixedExpense.findUnique({
      where: { id },
      include,
    });
    if (!expense) throw new NotFoundException('El gasto no existe');
    return this.toResponse(expense);
  }

  async create(dto: CreateExpenseDto): Promise<ExpenseResponseDto> {
    if (dto.endPeriod && dto.endPeriod < dto.startPeriod) {
      throw new BadRequestException(
        'endPeriod no puede ser anterior a startPeriod',
      );
    }
    try {
      // Los cargos mensuales no se crean acá: se generan al consultar /charges
      const expense = await this.prisma.fixedExpense.create({
        data: dto,
        include,
      });
      return this.toResponse(expense);
    } catch (err) {
      throw this.mapReferenceError(err);
    }
  }

  // Editar: los cambios impactan solo en lo pendiente; lo pagado nunca se toca
  async update(id: number, dto: UpdateExpenseDto): Promise<ExpenseResponseDto> {
    const existing = await this.prisma.fixedExpense.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('El gasto no existe');

    // Cómo queda el gasto después del cambio
    const startPeriod = dto.startPeriod ?? existing.startPeriod;
    const endPeriod =
      dto.endPeriod !== undefined ? dto.endPeriod : existing.endPeriod;
    if (endPeriod && endPeriod < startPeriod) {
      throw new BadRequestException(
        'endPeriod no puede ser anterior a startPeriod',
      );
    }

    // Reglas que protegen el historial de pagos
    const paidCharges = await this.prisma.monthlyCharge.findMany({
      where: { expenseId: id, status: 'PAID' },
      select: { period: true },
    });
    if (
      dto.currency &&
      dto.currency !== existing.currency &&
      paidCharges.length > 0
    ) {
      throw new ConflictException(
        'No se puede cambiar la moneda de un gasto con pagos registrados',
      );
    }
    const outside = paidCharges.filter(
      (c) => c.period < startPeriod || (endPeriod && c.period > endPeriod),
    );
    if (outside.length > 0) {
      throw new ConflictException(
        `La vigencia dejaría afuera pagos ya registrados (${outside.map((c) => c.period).join(', ')})`,
      );
    }

    const now = currentPeriod();
    const active = dto.active ?? existing.active;
    const debitDay = dto.debitDay ?? existing.debitDay;
    const oldEstimate = existing.estimatedAmount.toNumber();
    const newEstimate = dto.estimatedAmount ?? oldEstimate;

    try {
      // Transacción: o se aplican todos los cambios, o ninguno
      const updated = await this.prisma.$transaction(async (tx) => {
        const expense = await tx.fixedExpense.update({
          where: { id },
          data: { ...dto, endPeriod },
          include,
        });

        // Cargos pendientes que quedaron fuera de la vigencia: se borran
        await tx.monthlyCharge.deleteMany({
          where: {
            expenseId: id,
            status: 'PENDING',
            OR: [
              { period: { lt: startPeriod } },
              ...(endPeriod ? [{ period: { gt: endPeriod } }] : []),
            ],
          },
        });

        // Desactivado: deja de generar cargos desde este mes
        if (!active) {
          await tx.monthlyCharge.deleteMany({
            where: { expenseId: id, status: 'PENDING', period: { gte: now } },
          });
        }

        // Nuevo día o nuevo estimado: se aplica a los pendientes desde este mes.
        // El monto solo se pisa si no lo habías ajustado a mano (sigue igual al estimado viejo)
        if (debitDay !== existing.debitDay || newEstimate !== oldEstimate) {
          const pending = await tx.monthlyCharge.findMany({
            where: { expenseId: id, status: 'PENDING', period: { gte: now } },
          });
          for (const c of pending) {
            const wasEstimate = c.amount.toNumber() === oldEstimate;
            await tx.monthlyCharge.update({
              where: { id: c.id },
              data: {
                dueDate: dueDateFor(c.period, debitDay),
                ...(wasEstimate ? { amount: newEstimate } : {}),
              },
            });
          }
        }

        return expense;
      });
      return this.toResponse(updated);
    } catch (err) {
      throw this.mapReferenceError(err);
    }
  }

  // Eliminar: solo si nunca se registró un pago. Si no, hay que darlo de baja
  async remove(id: number): Promise<void> {
    const expense = await this.prisma.fixedExpense.findUnique({
      where: { id },
      include: { _count: include._count },
    });
    if (!expense) throw new NotFoundException('El gasto no existe');
    if (expense._count.charges > 0) {
      throw new ConflictException(
        'El gasto tiene pagos registrados y no se puede eliminar. Desactivalo o ponele fecha de fin para darlo de baja.',
      );
    }
    // Los cargos pendientes se borran en cascada (onDelete: Cascade)
    await this.prisma.fixedExpense.delete({ where: { id } });
  }

  private mapReferenceError(err: unknown) {
    if (prismaErrorCode(err) === 'P2003') {
      return new BadRequestException(
        'La categoría o el medio de pago no existen',
      );
    }
    return err;
  }

  // Decimal llega como objeto; el front espera un number. _count se aplana a paidCount
  private toResponse<T extends ExpenseWithRelations>(e: T) {
    const { _count, ...rest } = e;
    return {
      ...rest,
      estimatedAmount: e.estimatedAmount.toNumber(),
      paidCount: _count.charges,
    };
  }
}
