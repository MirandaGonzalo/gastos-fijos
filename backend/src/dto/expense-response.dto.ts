import { ApiProperty } from '@nestjs/swagger';
import {
  CURRENCIES,
  PAYMENT_MODES,
  type CurrencyCode,
  type PaymentModeCode,
} from './create-expense.dto';
import { CatalogItemResponseDto } from './catalog-item.dto';

// Forma de un gasto (plantilla) tal como lo devuelve la API
export class ExpenseResponseDto {
  /** @example 1 */
  id: number;

  /** @example 'Luz' */
  name: string;

  /** @example 100000 */
  estimatedAmount: number;

  @ApiProperty({ enum: CURRENCIES, example: 'ARS' })
  currency: CurrencyCode;

  @ApiProperty({ enum: PAYMENT_MODES, example: 'AUTOMATIC' })
  paymentMode: PaymentModeCode;

  /** @example 10 */
  debitDay: number;

  category: CatalogItemResponseDto;

  paymentMethod: CatalogItemResponseDto;

  /** @example '2026-10' */
  startPeriod: string;

  /** @example null */
  endPeriod: string | null;

  /** @example true */
  active: boolean;

  /**
   * Cantidad de cargos pagados. Si es mayor a 0, el gasto no se puede eliminar
   * @example 3
   */
  paidCount: number;

  createdAt: Date;

  updatedAt: Date;
}
