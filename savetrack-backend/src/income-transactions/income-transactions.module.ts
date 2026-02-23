import { Module } from '@nestjs/common';
import { IncomeTransactionsService } from './income-transactions.service';
import { IncomeTransactionsController } from './income-transactions.controller';

import { UserSettingsModule } from '../user-settings/user-settings.module';
import { FundingAccountsModule } from '../funding-accounts/funding-accounts.module';

@Module({
  imports: [UserSettingsModule, FundingAccountsModule],
  controllers: [IncomeTransactionsController],
  providers: [IncomeTransactionsService],
})
export class IncomeTransactionsModule { }
