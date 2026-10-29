import { IsOptional, Matches } from 'class-validator';
import { PERIOD_REGEX } from '../utils/period';

export class ChargesQueryDto {
  /**
   * Primer mes del rango (YYYY-MM). Por defecto, el mes actual
   * @example '2026-10'
   */
  @IsOptional()
  @Matches(PERIOD_REGEX, { message: 'from debe tener formato YYYY-MM' })
  from?: string;

  /**
   * Último mes del rango (YYYY-MM). Por defecto, igual a from
   * @example '2026-12'
   */
  @IsOptional()
  @Matches(PERIOD_REGEX, { message: 'to debe tener formato YYYY-MM' })
  to?: string;
}
