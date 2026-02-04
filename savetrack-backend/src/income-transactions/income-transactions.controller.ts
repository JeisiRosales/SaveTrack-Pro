import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { IncomeTransactionsService } from './income-transactions.service';
import { CreateIncomeTransactionDto } from './dto/create-income-transaction.dto';
import { AuthGuard } from '@nestjs/passport';

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

  //Obtener transacciones de ingreso por cuenta
  @Get('account/:account_id')
  findAllByAccount(@Request() req, @Param('account_id') accountId: string) {
    return this.incomeTransactionsService.findAllByAccount(req.user.sub, accountId);
  }

  // Obtener una transacción de ingreso por ID
  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.incomeTransactionsService.findOne(id, req.user.sub);
  }
}