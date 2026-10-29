import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ExpensesService } from '../services/expenses.service';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import { ExpenseResponseDto } from '../dto/expense-response.dto';

@ApiTags('Gastos fijos')
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @ApiOperation({
    summary: 'Lista los gastos fijos, ordenados por día de débito',
  })
  @ApiOkResponse({ type: [ExpenseResponseDto] })
  findAll(): Promise<ExpenseResponseDto[]> {
    return this.expensesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un gasto fijo' })
  @ApiOkResponse({ type: ExpenseResponseDto })
  @ApiNotFoundResponse({ description: 'El gasto no existe' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ExpenseResponseDto> {
    return this.expensesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crea un gasto fijo' })
  @ApiCreatedResponse({ type: ExpenseResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  create(@Body() dto: CreateExpenseDto): Promise<ExpenseResponseDto> {
    return this.expensesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Edita un gasto fijo',
    description:
      'Los cambios de día y monto estimado se aplican a los cargos pendientes desde el mes actual (los montos ajustados a mano se respetan). Los pagos registrados nunca se modifican.',
  })
  @ApiOkResponse({ type: ExpenseResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiNotFoundResponse({ description: 'El gasto no existe' })
  @ApiConflictResponse({
    description: 'El cambio afectaría pagos registrados (moneda o vigencia)',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExpenseDto,
  ): Promise<ExpenseResponseDto> {
    return this.expensesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Elimina un gasto fijo (solo si no tiene pagos registrados)',
  })
  @ApiNoContentResponse({ description: 'Eliminado' })
  @ApiNotFoundResponse({ description: 'El gasto no existe' })
  @ApiConflictResponse({
    description: 'Tiene pagos registrados: hay que darlo de baja',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.expensesService.remove(id);
  }
}
