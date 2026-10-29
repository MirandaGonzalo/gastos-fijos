import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ChargesService } from '../services/charges.service';
import { ChargesQueryDto } from '../dto/charges-query.dto';
import { ChargeResponseDto } from '../dto/charge-response.dto';
import { UpdateChargeDto } from '../dto/update-charge.dto';

@ApiTags('Cargos mensuales')
@Controller('charges')
export class ChargesController {
  constructor(private readonly chargesService: ChargesService) {}

  @Get()
  @ApiOperation({
    summary: 'Lista los cargos de un rango de meses',
    description:
      'Genera los cargos que falten a partir de los gastos vigentes (con el monto estimado) y los devuelve ordenados por fecha de débito.',
  })
  @ApiOkResponse({ type: [ChargeResponseDto] })
  @ApiBadRequestResponse({ description: 'Rango inválido' })
  findByRange(@Query() query: ChargesQueryDto): Promise<ChargeResponseDto[]> {
    return this.chargesService.findByRange(query.from, query.to);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Paga, deshace el pago o ajusta el monto real de un cargo',
    description:
      'Con paid=true lo marca pagado (paidAt por defecto: hoy). Con paid=false vuelve a pendiente. amount ajusta el monto real del mes.',
  })
  @ApiOkResponse({ type: ChargeResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiNotFoundResponse({ description: 'El cargo no existe' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateChargeDto,
  ): Promise<ChargeResponseDto> {
    return this.chargesService.update(id, dto);
  }
}
