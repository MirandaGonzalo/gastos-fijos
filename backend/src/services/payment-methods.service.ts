import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CatalogItemResponseDto } from '../dto/catalog-item.dto';
import { mapCatalogError } from '../utils/prisma-errors';

const select = { id: true, name: true };
const LABEL = 'El medio de pago';

@Injectable()
export class PaymentMethodsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<CatalogItemResponseDto[]> {
    return this.prisma.paymentMethod.findMany({
      select,
      orderBy: { name: 'asc' },
    });
  }

  async create(name: string): Promise<CatalogItemResponseDto> {
    try {
      return await this.prisma.paymentMethod.create({
        data: { name: name.trim() },
        select,
      });
    } catch (err) {
      throw mapCatalogError(err, LABEL, name);
    }
  }

  async update(id: number, name: string): Promise<CatalogItemResponseDto> {
    try {
      return await this.prisma.paymentMethod.update({
        where: { id },
        data: { name: name.trim() },
        select,
      });
    } catch (err) {
      throw mapCatalogError(err, LABEL, name);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      // Si algún gasto la usa, la FK (onDelete: Restrict) lo impide -> 409
      await this.prisma.paymentMethod.delete({ where: { id } });
    } catch (err) {
      throw mapCatalogError(err, LABEL);
    }
  }
}
