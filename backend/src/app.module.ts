import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { PrismaModule } from './modules/prisma.module';
import { ExpensesModule } from './modules/expenses.module';
import { ChargesModule } from './modules/charges.module';
import { CatalogsModule } from './modules/catalogs.module';
import { ExchangeRatesModule } from './modules/exchange-rates.module';

@Module({
  imports: [
    PrismaModule,
    ExpensesModule,
    ChargesModule,
    CatalogsModule,
    ExchangeRatesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
