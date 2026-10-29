// Cotización de un tipo de dólar
export class ExchangeRateDto {
  /**
   * Identificador del tipo de dólar
   * @example 'tarjeta'
   */
  type: string;

  /** @example 'Tarjeta' */
  name: string;

  /**
   * Precio de compra (a cuánto te lo compran)
   * @example 1350
   */
  buy: number | null;

  /**
   * Precio de venta (a cuánto lo comprás vos)
   * @example 1410
   */
  sell: number;

  /** Cuándo se actualizó la cotización en la fuente */
  updatedAt: string;
}
