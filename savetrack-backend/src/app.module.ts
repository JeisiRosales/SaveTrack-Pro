import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { FundingAccountsModule } from './funding-accounts/funding-accounts.module';
import { SavingsGoalsModule } from './savings-goals/savings-goals.module';
import { TransactionsModule } from './transactions/transactions.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { UserSettingsModule } from './user-settings/user-settings.module';
import { IncomeCategoriesModule } from './income-categories/income-categories.module';
import { ExpenseCategoriesModule } from './expense-categories/expense-categories.module';
import { IncomeTransactionsModule } from './income-transactions/income-transactions.module';
import { ExpenseTransactionsModule } from './expense-transactions/expense-transactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Variables de entorno globales
    SupabaseModule,
    AuthModule,
    FundingAccountsModule,
    SavingsGoalsModule,
    TransactionsModule,
    UsersModule,
    UserSettingsModule,
    IncomeCategoriesModule,
    ExpenseCategoriesModule,
    IncomeTransactionsModule,
    ExpenseTransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
