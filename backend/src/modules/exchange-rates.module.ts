import { Module } from '@nestjs/common';
import { ExchangeRatesController } from '../controllers/exchange-rates.controller';
import { ExchangeRatesService } from '../services/exchange-rates.service';

@Module({
  controllers: [ExchangeRatesController],
  providers: [ExchangeRatesService],
})
export class ExchangeRatesModule {}
