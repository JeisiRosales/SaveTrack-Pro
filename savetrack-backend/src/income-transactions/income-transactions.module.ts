import { Module } from '@nestjs/common';
import { IncomeTransactionsService } from './income-transactions.service';
import { IncomeTransactionsController } from './income-transactions.controller';

@Module({
  controllers: [IncomeTransactionsController],
  providers: [IncomeTransactionsService],
})
export class IncomeTransactionsModule {}
