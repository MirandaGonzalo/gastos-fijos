import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

// Sirve para crear y renombrar categorías y medios de pago
export class CatalogItemDto {
  /**
   * Nombre (único)
   * @example 'Servicios'
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;
}

export class CatalogItemResponseDto {
  /** @example 1 */
  id: number;

  /** @example 'Servicios' */
  name: string;
}
