import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  Matches,
} from 'class-validator';

export class UpdateChargeDto {
  /**
   * Monto real de ese mes (si difiere del estimado)
   * @example 98500
   */
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount?: number;

  /**
   * Solo para cargos en USD: pesos por dólar al que compraste para pagarlo
   * @example 1385.5
   */
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  exchangeRate?: number;

  /**
   * true = marcar como pagado, false = volver a pendiente
   * @example true
   */
  @IsOptional()
  @IsBoolean()
  paid?: boolean;

  /**
   * Fecha en que se pagó (YYYY-MM-DD). Si se marca pagado sin fecha, se usa hoy
   * @example '2026-10-10'
   */
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'paidAt debe tener formato YYYY-MM-DD',
  })
  paidAt?: string;
}
