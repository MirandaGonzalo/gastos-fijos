import { Module } from '@nestjs/common';
import { CategoriesController } from '../controllers/categories.controller';
import { PaymentMethodsController } from '../controllers/payment-methods.controller';
import { CategoriesService } from '../services/categories.service';
import { PaymentMethodsService } from '../services/payment-methods.service';

// Catálogos: categorías y medios de pago
@Module({
  controllers: [CategoriesController, PaymentMethodsController],
  providers: [CategoriesService, PaymentMethodsService],
})
export class CatalogsModule {}
