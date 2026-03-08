import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ExpenseTransactionsService } from './expense-transactions.service';
import { CreateExpenseTransactionDto } from './dto/create-expense-transaction.dto';
import { UpdateExpenseTransactionDto } from './dto/update-expense-transaction.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('expense-transactions')
@UseGuards(AuthGuard('jwt'))
export class ExpenseTransactionsController {
  constructor(private readonly expenseTransactionsService: ExpenseTransactionsService) { }

  // Crear una transaccion de gasto
  @Post()
  create(@Request() req, @Body() createDto: CreateExpenseTransactionDto) {
    return this.expenseTransactionsService.create(req.user.id, createDto);
  }

  // Listar transacciones
  @Get()
  findAll(@Request() req, @Query('account_id') accountId?: string) {
    return this.expenseTransactionsService.findAll(req.user.id, accountId);
  }

  // Listar transacciones por ID
  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.expenseTransactionsService.findOne(id, req.user.id);
  }

  // Modificar una transaccion de gasto
  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateDto: UpdateExpenseTransactionDto) {
    return this.expenseTransactionsService.update(id, req.user.id, updateDto);
  }

  // Eliminar una transaccion de gasto
  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.expenseTransactionsService.remove(id, req.user.id);
  }
}