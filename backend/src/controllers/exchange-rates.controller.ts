import { Controller, Get } from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ExchangeRatesService } from '../services/exchange-rates.service';
import { ExchangeRateDto } from '../dto/exchange-rate.dto';

@ApiTags('Cotizaciones')
@Controller('exchange-rates')
export class ExchangeRatesController {
  constructor(private readonly service: ExchangeRatesService) {}

  @Get()
  @ApiOperation({
    summary: 'Cotizaciones actuales del dólar (oficial, tarjeta, MEP, blue...)',
    description: 'Fuente: DolarApi. Se cachea 10 minutos.',
  })
  @ApiOkResponse({ type: [ExchangeRateDto] })
  @ApiBadGatewayResponse({ description: 'La API de cotizaciones no respondió' })
  findAll(): Promise<ExchangeRateDto[]> {
    return this.service.findAll();
  }
}
