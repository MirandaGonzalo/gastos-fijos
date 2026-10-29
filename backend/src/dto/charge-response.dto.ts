import { ApiProperty } from '@nestjs/swagger';
import {
  CURRENCIES,
  PAYMENT_MODES,
  type CurrencyCode,
  type PaymentModeCode,
} from './create-expense.dto';
import { CatalogItemResponseDto } from './catalog-item.dto';

export const CHARGE_STATUSES = ['PENDING', 'PAID'] as const;
export type ChargeStatusCode = (typeof CHARGE_STATUSES)[number];

class ChargeExpenseDto {
  /** @example 1 */
  id: number;

  /** @example 'Luz' */
  name: string;

  category: CatalogItemResponseDto;

  paymentMethod: CatalogItemResponseDto;

  @ApiProperty({ enum: CURRENCIES, example: 'ARS' })
  currency: CurrencyCode;

  @ApiProperty({ enum: PAYMENT_MODES, example: 'AUTOMATIC' })
  paymentMode: PaymentModeCode;

  /** @example 10 */
  debitDay: number;
}

// Un cargo mensual: el gasto aplicado a un mes concreto
export class ChargeResponseDto {
  /** @example 1 */
  id: number;

  /** @example '2026-10' */
  period: string;

  /**
   * Fecha de débito (YYYY-MM-DD)
   * @example '2026-10-10'
   */
  dueDate: string;

  /** @example 98500 */
  amount: number;

  /**
   * Solo USD: cotización a la que se compró (pesos por dólar)
   * @example null
   */
  exchangeRate: number | null;

  /**
   * Costo real en pesos: el monto si es ARS, o monto × cotización si es USD pagado. null si es USD sin cotización
   * @example 98500
   */
  amountArs: number | null;

  @ApiProperty({ enum: CHARGE_STATUSES, example: 'PENDING' })
  status: ChargeStatusCode;

  /** @example null */
  paidAt: Date | null;

  expense: ChargeExpenseDto;
}
