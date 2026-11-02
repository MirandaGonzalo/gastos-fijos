import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { PrismaModule } from './modules/prisma.module';
import { ExpensesModule } from './modules/expenses.module';
import { ChargesModule } from './modules/charges.module';
import { CatalogsModule } from './modules/catalogs.module';
import { ExchangeRatesModule } from './modules/exchange-rates.module';
import { UnitsModule } from './modules/units.module';

@Module({
  imports: [
    PrismaModule,
    ExpensesModule,
    ChargesModule,
    CatalogsModule,
    ExchangeRatesModule,
    UnitsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
