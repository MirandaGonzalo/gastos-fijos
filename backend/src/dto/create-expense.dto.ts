import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { PERIOD_REGEX } from '../utils/period';

export const CURRENCIES = ['ARS', 'USD'] as const;
export type CurrencyCode = (typeof CURRENCIES)[number];

export const PAYMENT_MODES = ['AUTOMATIC', 'MANUAL'] as const;
export type PaymentModeCode = (typeof PAYMENT_MODES)[number];

// Unidad a la que se asigna el gasto y qué porcentaje le corresponde
export class ExpenseUnitDto {
  /** @example 1 */
  @IsInt()
  @Min(1)
  unitId: number;

  /**
   * Porcentaje del gasto para esta unidad. La suma de todas tiene que dar 100
   * @example 50
   */
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(100)
  share: number;
}

export class CreateExpenseDto {
  /**
   * Nombre del gasto
   * @example 'Luz'
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string;

  /**
   * Monto estimado por mes. Cada mes se puede ajustar al monto real
   * @example 100000
   */
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  estimatedAmount: number;

  /** Moneda del gasto */
  @ApiProperty({ enum: CURRENCIES, example: 'ARS' })
  @IsIn(CURRENCIES)
  currency: CurrencyCode;

  /**
   * AUTOMATIC: se debita solo ese día. MANUAL: ese día vence y hay que pagarlo antes
   */
  @ApiProperty({ enum: PAYMENT_MODES, example: 'AUTOMATIC' })
  @IsIn(PAYMENT_MODES)
  paymentMode: PaymentModeCode;

  /**
   * Día del mes (1 a 31): de débito si es AUTOMATIC, de vencimiento si es MANUAL
   * @example 10
   */
  @IsInt()
  @Min(1)
  @Max(31)
  debitDay: number;

  /**
   * Id de la categoría (ver GET /categories)
   * @example 1
   */
  @IsInt()
  @Min(1)
  categoryId: number;

  /**
   * Id del medio de pago (ver GET /payment-methods)
   * @example 1
   */
  @IsInt()
  @Min(1)
  paymentMethodId: number;

  /**
   * Primer mes en que aplica (YYYY-MM)
   * @example '2026-10'
   */
  @Matches(PERIOD_REGEX, { message: 'startPeriod debe tener formato YYYY-MM' })
  startPeriod: string;

  /**
   * Último mes en que aplica (YYYY-MM). Si no se envía, es indefinido
   * @example '2027-03'
   */
  @IsOptional()
  @Matches(PERIOD_REGEX, { message: 'endPeriod debe tener formato YYYY-MM' })
  endPeriod?: string;

  /**
   * Si el gasto está vigente. Por defecto true
   * @example true
   */
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  /**
   * Unidades a las que corresponde el gasto, con su reparto (tiene que sumar 100).
   * Vacío o sin enviar = gasto general, sin unidad. Al editar, reemplaza la asignación completa
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpenseUnitDto)
  units?: ExpenseUnitDto[];
}
