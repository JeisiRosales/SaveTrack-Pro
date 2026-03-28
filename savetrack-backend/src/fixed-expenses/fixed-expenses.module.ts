import { Module } from '@nestjs/common';
import { FixedExpensesService } from './fixed-expenses.service';
import { FixedExpensesController } from './fixed-expenses.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [FixedExpensesController],
  providers: [FixedExpensesService],
  exports: [FixedExpensesService]
})
export class FixedExpensesModule {}
