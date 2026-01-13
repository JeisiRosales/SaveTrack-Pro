// =============================================
// Módulo Principal de la Aplicación
// Ubicación: src/app.module.ts
// =============================================
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Variables de entorno globales
    SupabaseModule,
    AuthModule,
    FundingAccountsModule,
    SavingsGoalsModule,
    TransactionsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
