import { PartialType } from '@nestjs/swagger';
import { CreateExpenseDto } from './create-expense.dto';

// Todos los campos de creación, pero opcionales (mantiene las validaciones y la doc de Swagger)
export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {}
