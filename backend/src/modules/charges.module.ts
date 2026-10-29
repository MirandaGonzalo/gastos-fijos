import { Module } from '@nestjs/common';
import { ChargesController } from '../controllers/charges.controller';
import { ChargesService } from '../services/charges.service';

@Module({
  controllers: [ChargesController],
  providers: [ChargesService],
})
export class ChargesModule {}
