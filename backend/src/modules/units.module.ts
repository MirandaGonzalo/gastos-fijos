import { Module } from '@nestjs/common';
import { UnitsController } from '../controllers/units.controller';
import { UnitsService } from '../services/units.service';

@Module({
  controllers: [UnitsController],
  providers: [UnitsService],
})
export class UnitsModule {}
