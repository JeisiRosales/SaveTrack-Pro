import { Module } from '@nestjs/common';
import { ExpenseTransactionsService } from './expense-transactions.service';
import { ExpenseTransactionsController } from './expense-transactions.controller';

@Module({
  controllers: [ExpenseTransactionsController],
  providers: [ExpenseTransactionsService],
})
export class ExpenseTransactionsModule {}
