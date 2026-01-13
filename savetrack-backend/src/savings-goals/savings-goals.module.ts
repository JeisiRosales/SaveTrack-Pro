// =============================================
// Módulo de Metas de Ahorro
// Ubicación: src/savings-goals/savings-goals.module.ts
// =============================================
import { Module } from '@nestjs/common';
import { SavingsGoalsService } from './savings-goals.service';
import { SavingsGoalsController } from './savings-goals.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
    imports: [SupabaseModule],
    controllers: [SavingsGoalsController],
    providers: [SavingsGoalsService],
    exports: [SavingsGoalsService],
})
export class SavingsGoalsModule { }
