import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { UserSettingsService } from '../user-settings/user-settings.service';

@Injectable()
export class TransactionsService {
    constructor(
        private supabase: SupabaseService,
        private userSettingsService: UserSettingsService
    ) { }

    /**
     * Crea una nueva transacción y actualiza los balances automáticamente
     * @param userId - ID del usuario
     * @param dto - Datos de la transacción
     */
    async create(userId: string, dto: CreateTransactionDto): Promise<Transaction> {
        const supabase = this.supabase.getAdminClient();

        // 0. Validar si la cuenta debe ser la de ahorros designada
        const settings = await this.userSettingsService.findByUserId(userId);
        if (settings.savings_account_id && dto.accountId !== settings.savings_account_id) {
            throw new BadRequestException('Las transacciones de metas de ahorro solo pueden realizarse desde la cuenta de ahorros designada.');
        }

        // Contexto de la cuenta
        const { data: account, error: accountError } = await supabase
            .from('funding_accounts')
            .select('balance')
            .eq('id', dto.accountId)
            .eq('user_id', userId)
            .single();

        // Contexto de la meta
        const { data: goal, error: goalError } = await supabase
            .from('savings_goals')
            .select('current_amount')
            .eq('id', dto.goalId)
            .single();

        // ------ VALIDACIONES ------

        // Validación de la cuenta
        if (accountError || !account) {
            throw new NotFoundException(`Cuenta no encontrada: ${dto.accountId}`);
        }

        // Validación de la meta
        if (goalError || !goal) {
            throw new NotFoundException(`Meta no encontrada: ${dto.goalId}`);
        }

        // Validación de saldo
        if (dto.amount > account.balance) {
            throw new Error('Saldo insuficiente en la cuenta');
        }

        // Crear el registro de la transacción
        const { data: transaction, error: txError } = await supabase
            .from('transactions')
            .insert({
                goal_id: dto.goalId,
                account_id: dto.accountId,
                amount: dto.amount,
                type: dto.type,
            })
            .select()
            .single();

        if (txError) throw txError;

        // Si es depósito: suma, si es retiro: resta
        const newAmount = dto.type === 'deposit'
            ? goal.current_amount + dto.amount
            : goal.current_amount - dto.amount;

        await supabase
            .from('savings_goals')
            .update({ current_amount: newAmount })
            .eq('id', dto.goalId);

        // Si es depósito: resta de la cuenta, si es retiro: suma a la cuenta
        const newBalance = dto.type === 'deposit'
            ? account.balance - dto.amount
            : account.balance + dto.amount;

        await supabase
            .from('funding_accounts')
            .update({ balance: newBalance })
            .eq('id', dto.accountId);

        return transaction as Transaction;
    }

    /**
     * Obtiene todas las transacciones de una meta específica
     * Incluye el nombre de la cuenta fuente mediante JOIN
     * @param goalId - ID de la meta
     */
    async findByGoal(goalId: string): Promise<Transaction[]> {
        const { data, error } = await this.supabase.getClient()
            .from('transactions')
            .select('*, funding_accounts(name)')
            .eq('goal_id', goalId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Transaction[];
    }

    /**
     * Obtiene todas las transacciones de un usuario
     * Filtra a través de las cuentas que pertenecen al usuario
     * @param userId - ID del usuario
     */
    async findAllByUser(userId: string): Promise<Transaction[]> {
        const supabase = this.supabase.getAdminClient();

        // Obtener los IDs de las cuentas del usuario
        const { data: accounts, error: accError } = await supabase
            .from('funding_accounts')
            .select('id')
            .eq('user_id', userId);

        if (accError) throw accError;
        if (!accounts || accounts.length === 0) return [];

        const accountIds = accounts.map(acc => acc.id);

        // Obtener transacciones for esas cuentas
        const { data, error } = await supabase
            .from('transactions')
            .select('*, funding_accounts(name), savings_goals(name)')
            .in('account_id', accountIds)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;
        return data as Transaction[];
    }
}
