import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export const UNIT_TYPES = ['PROPERTY', 'VEHICLE', 'OTHER'] as const;
export type UnitTypeCode = (typeof UNIT_TYPES)[number];

export class CreateUnitDto {
  /**
   * Nombre de la unidad (único)
   * @example 'Depto Nueva Córdoba'
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name: string;

  /** PROPERTY: casa o depto · VEHICLE: auto o moto · OTHER: cualquier otra cosa */
  @ApiProperty({ enum: UNIT_TYPES, example: 'PROPERTY' })
  @IsIn(UNIT_TYPES)
  type: UnitTypeCode;

  /**
   * Dirección, patente o lo que sirva para identificarla
   * @example 'Bv. San Juan 500, 4°B'
   */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  description?: string;
}

export class UpdateUnitDto extends PartialType(CreateUnitDto) {}

export class UnitResponseDto {
  /** @example 1 */
  id: number;

  /** @example 'Depto Nueva Córdoba' */
  name: string;

  @ApiProperty({ enum: UNIT_TYPES, example: 'PROPERTY' })
  type: UnitTypeCode;

  /** @example 'Bv. San Juan 500, 4°B' */
  description: string | null;

  /**
   * Cantidad de gastos asignados. Si es mayor a 0, no se puede borrar
   * @example 4
   */
  expenseCount: number;
}

// Unidad asignada a un gasto, con su porcentaje del reparto
export class ExpenseUnitResponseDto {
  /** @example 1 */
  id: number;

  /** @example 'Depto Nueva Córdoba' */
  name: string;

  @ApiProperty({ enum: UNIT_TYPES, example: 'PROPERTY' })
  type: UnitTypeCode;

  /**
   * Porcentaje del gasto que le corresponde a esta unidad
   * @example 50
   */
  share: number;
}
