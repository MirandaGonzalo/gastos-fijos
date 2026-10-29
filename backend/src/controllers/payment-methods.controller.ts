import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PaymentMethodsService } from '../services/payment-methods.service';
import {
  CatalogItemDto,
  CatalogItemResponseDto,
} from '../dto/catalog-item.dto';

@ApiTags('Medios de pago')
@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly service: PaymentMethodsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista los medios de pago, ordenados por nombre' })
  @ApiOkResponse({ type: [CatalogItemResponseDto] })
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Crea un medio de pago' })
  @ApiCreatedResponse({ type: CatalogItemResponseDto })
  @ApiConflictResponse({ description: 'Ya existe uno con ese nombre' })
  create(@Body() dto: CatalogItemDto) {
    return this.service.create(dto.name);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Renombra un medio de pago' })
  @ApiOkResponse({ type: CatalogItemResponseDto })
  @ApiNotFoundResponse({ description: 'No existe' })
  @ApiConflictResponse({ description: 'Ya existe uno con ese nombre' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CatalogItemDto) {
    return this.service.update(id, dto.name);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Borra un medio de pago (solo si ningún gasto lo usa)',
  })
  @ApiNoContentResponse({ description: 'Borrado' })
  @ApiNotFoundResponse({ description: 'No existe' })
  @ApiConflictResponse({ description: 'Está en uso por algún gasto' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
