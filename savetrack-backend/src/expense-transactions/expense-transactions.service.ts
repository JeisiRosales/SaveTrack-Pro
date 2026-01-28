import { Injectable } from '@nestjs/common';
import { CreateExpenseTransactionDto } from './dto/create-expense-transaction.dto';
import { UpdateExpenseTransactionDto } from './dto/update-expense-transaction.dto';

@Injectable()
export class ExpenseTransactionsService {
  create(createExpenseTransactionDto: CreateExpenseTransactionDto) {
    return 'This action adds a new expenseTransaction';
  }

  findAll() {
    return `This action returns all expenseTransactions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} expenseTransaction`;
  }

  update(id: number, updateExpenseTransactionDto: UpdateExpenseTransactionDto) {
    return `This action updates a #${id} expenseTransaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} expenseTransaction`;
  }
}
