import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, Patch, Delete } from '@nestjs/common';
import { IncomeTransactionsService } from './income-transactions.service';
import { CreateIncomeTransactionDto } from './dto/create-income-transaction.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateIncomeTransactionDto } from './dto/update-income-transaction.dto';

@Controller('income-transactions')
@UseGuards(AuthGuard('jwt'))
export class IncomeTransactionsController {
  constructor(private readonly incomeTransactionsService: IncomeTransactionsService) { }

  // Crear una transacción de ingreso
  @Post()
  create(@Request() req, @Body() createDto: CreateIncomeTransactionDto) {
    return this.incomeTransactionsService.create(req.user.sub, createDto);
  }

  // Obtener todas las transacciones de ingreso
  @Get()
  findAll(@Request() req, @Query('account_id') accountId?: string) {
    return this.incomeTransactionsService.findAll(req.user.sub, accountId);
  }

  // Obtener una transacción de ingreso por ID
  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.incomeTransactionsService.findOne(id, req.user.sub);
  }

  //Actualizar una transacción de ingreso
  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateDto: UpdateIncomeTransactionDto) {
    return this.incomeTransactionsService.update(id, req.user.sub, updateDto);
  }

  //Eliminar una transacción de ingreso
  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.incomeTransactionsService.remove(id, req.user.sub);
  }
}