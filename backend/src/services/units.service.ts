import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateUnitDto, UnitResponseDto, UpdateUnitDto } from '../dto/unit.dto';
import { mapCatalogError } from '../utils/prisma-errors';

const LABEL = 'La unidad';

// Incluye cuántos gastos tiene asignados (COUNT en la misma consulta)
const include = { _count: { select: { expenses: true } } };

type UnitWithCount = {
  id: number;
  name: string;
  type: UnitResponseDto['type'];
  description: string | null;
  _count: { expenses: number };
};

function toResponse({ _count, ...unit }: UnitWithCount): UnitResponseDto {
  return { ...unit, expenseCount: _count.expenses };
}

@Injectable()
export class UnitsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<UnitResponseDto[]> {
    const units = await this.prisma.unit.findMany({
      include,
      orderBy: { name: 'asc' },
    });
    return units.map(toResponse);
  }

  async create(dto: CreateUnitDto): Promise<UnitResponseDto> {
    try {
      const unit = await this.prisma.unit.create({
        data: { ...dto, name: dto.name.trim() },
        include,
      });
      return toResponse(unit);
    } catch (err) {
      throw mapCatalogError(err, LABEL, dto.name);
    }
  }

  async update(id: number, dto: UpdateUnitDto): Promise<UnitResponseDto> {
    try {
      const unit = await this.prisma.unit.update({
        where: { id },
        data: { ...dto, name: dto.name?.trim() },
        include,
      });
      return toResponse(unit);
    } catch (err) {
      throw mapCatalogError(err, LABEL, dto.name);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      // Si tiene gastos asignados, la FK (onDelete: Restrict) lo impide -> 409
      await this.prisma.unit.delete({ where: { id } });
    } catch (err) {
      throw mapCatalogError(err, LABEL);
    }
  }
}
