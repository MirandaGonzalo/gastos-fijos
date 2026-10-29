import { Module } from '@nestjs/common';
import { ExpensesController } from '../controllers/expenses.controller';
import { ExpensesService } from '../services/expenses.service';

@Module({
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}
