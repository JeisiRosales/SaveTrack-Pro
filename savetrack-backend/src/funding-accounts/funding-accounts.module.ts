// =============================================
// Módulo de Cuentas de Financiamiento
// Ubicación: src/funding-accounts/funding-accounts.module.ts
// =============================================
import { Module } from '@nestjs/common';
import { FundingAccountsService } from './funding-accounts.service';
import { FundingAccountsController } from './funding-accounts.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
    imports: [SupabaseModule],
    controllers: [FundingAccountsController],
    providers: [FundingAccountsService],
    exports: [FundingAccountsService],
})
export class FundingAccountsModule { }
