import { UserSettingsModule } from '../user-settings/user-settings.module';
import { TransactionsService } from './transactions.service';
import { Module } from '@nestjs/common';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { TransactionsController } from './transactions.controller';

@Module({
    imports: [SupabaseModule, UserSettingsModule],
    controllers: [TransactionsController],
    providers: [TransactionsService],
    exports: [TransactionsService],
})
export class TransactionsModule { }
