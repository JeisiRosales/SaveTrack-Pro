import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExpenseTransactionsService } from './expense-transactions.service';
import { CreateExpenseTransactionDto } from './dto/create-expense-transaction.dto';
import { UpdateExpenseTransactionDto } from './dto/update-expense-transaction.dto';

@Controller('expense-transactions')
export class ExpenseTransactionsController {
  constructor(private readonly expenseTransactionsService: ExpenseTransactionsService) {}

  @Post()
  create(@Body() createExpenseTransactionDto: CreateExpenseTransactionDto) {
    return this.expenseTransactionsService.create(createExpenseTransactionDto);
  }

  @Get()
  findAll() {
    return this.expenseTransactionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expenseTransactionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpenseTransactionDto: UpdateExpenseTransactionDto) {
    return this.expenseTransactionsService.update(+id, updateExpenseTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expenseTransactionsService.remove(+id);
  }
}
