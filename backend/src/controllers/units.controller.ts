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
import { UnitsService } from '../services/units.service';
import { CreateUnitDto, UnitResponseDto, UpdateUnitDto } from '../dto/unit.dto';

@ApiTags('Unidades')
@Controller('units')
export class UnitsController {
  constructor(private readonly service: UnitsService) {}

  @Get()
  @ApiOperation({
    summary:
      'Lista las unidades (propiedades, vehículos, etc.), ordenadas por nombre',
  })
  @ApiOkResponse({ type: [UnitResponseDto] })
  findAll(): Promise<UnitResponseDto[]> {
    return this.service.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Crea una unidad' })
  @ApiCreatedResponse({ type: UnitResponseDto })
  @ApiConflictResponse({ description: 'Ya existe una unidad con ese nombre' })
  create(@Body() dto: CreateUnitDto): Promise<UnitResponseDto> {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edita una unidad' })
  @ApiOkResponse({ type: UnitResponseDto })
  @ApiNotFoundResponse({ description: 'No existe' })
  @ApiConflictResponse({ description: 'Ya existe una unidad con ese nombre' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUnitDto,
  ): Promise<UnitResponseDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Borra una unidad (solo si no tiene gastos asignados)',
  })
  @ApiNoContentResponse({ description: 'Borrada' })
  @ApiNotFoundResponse({ description: 'No existe' })
  @ApiConflictResponse({ description: 'Tiene gastos asignados' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}
