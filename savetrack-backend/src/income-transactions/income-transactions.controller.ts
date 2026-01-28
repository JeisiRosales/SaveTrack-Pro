import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IncomeTransactionsService } from './income-transactions.service';
import { CreateIncomeTransactionDto } from './dto/create-income-transaction.dto';
import { UpdateIncomeTransactionDto } from './dto/update-income-transaction.dto';

@Controller('income-transactions')
export class IncomeTransactionsController {
  constructor(private readonly incomeTransactionsService: IncomeTransactionsService) {}

  @Post()
  create(@Body() createIncomeTransactionDto: CreateIncomeTransactionDto) {
    return this.incomeTransactionsService.create(createIncomeTransactionDto);
  }

  @Get()
  findAll() {
    return this.incomeTransactionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incomeTransactionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIncomeTransactionDto: UpdateIncomeTransactionDto) {
    return this.incomeTransactionsService.update(+id, updateIncomeTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.incomeTransactionsService.remove(+id);
  }
}
