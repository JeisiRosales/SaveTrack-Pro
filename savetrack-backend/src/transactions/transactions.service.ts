import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransferDto } from './dto/transfer.dto';

@Injectable()
export class TransactionsService {
    constructor(private supabase: SupabaseService) { }

    /**
     * Crea una nueva transacción y actualiza los balances automáticamente
     * 
     * Lógica:
     * - DEPOSIT: Transfiere dinero de la cuenta a la meta
     *   - Resta del balance de la cuenta
     *   - Suma al current_amount de la meta
     * 
     * - WITHDRAWAL: Retira dinero de la meta y lo devuelve a la cuenta
     *   - Suma al balance de la cuenta
     *   - Resta del current_amount de la meta
     * 
     * @param dto - Datos de la transacción
     */
    async create(dto: CreateTransactionDto) {
        const supabase = this.supabase.getAdminClient();

        // Paso 1: Crear el registro de la transacción
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

        // Paso 2: Actualizar current_amount de la meta
        const { data: goal, error: goalError } = await supabase
            .from('savings_goals')
            .select('current_amount')
            .eq('id', dto.goalId)
            .single();

        if (goalError || !goal) {
            throw new NotFoundException(`Goal not found: ${dto.goalId}`);
        }

        // Si es depósito: suma, si es retiro: resta
        const newAmount = dto.type === 'deposit'
            ? goal.current_amount + dto.amount
            : goal.current_amount - dto.amount;

        await supabase
            .from('savings_goals')
            .update({ current_amount: newAmount })
            .eq('id', dto.goalId);

        // Paso 3: Actualizar balance de la cuenta
        const { data: account, error: accountError } = await supabase
            .from('funding_accounts')
            .select('balance')
            .eq('id', dto.accountId)
            .single();

        if (accountError || !account) {
            throw new NotFoundException(`Account not found: ${dto.accountId}`);
        }

        // Si es depósito: resta de la cuenta, si es retiro: suma a la cuenta
        const newBalance = dto.type === 'deposit'
            ? account.balance - dto.amount
            : account.balance + dto.amount;

        await supabase
            .from('funding_accounts')
            .update({ balance: newBalance })
            .eq('id', dto.accountId);

        return transaction;
    }

    /**
     * Obtiene todas las transacciones de una meta específica
     * Incluye el nombre de la cuenta fuente mediante JOIN
     * @param goalId - ID de la meta
     */
    async findByGoal(goalId: string) {
        const { data, error } = await this.supabase.getClient()
            .from('transactions')
            .select('*, funding_accounts(name)')
            .eq('goal_id', goalId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    /**
     * Obtiene todas las transacciones de un usuario
     * Filtra a través de las cuentas que pertenecen al usuario
     * @param userId - ID del usuario
     */
    async findAllByUser(userId: string) {
        const supabase = this.supabase.getAdminClient();

        // 1. Obtener los IDs de las cuentas del usuario
        const { data: accounts, error: accError } = await supabase
            .from('funding_accounts')
            .select('id')
            .eq('user_id', userId);

        if (accError) throw accError;
        if (!accounts || accounts.length === 0) return [];

        const accountIds = accounts.map(acc => acc.id);

        // 2. Obtener transacciones for esas cuentas
        const { data, error } = await supabase
            .from('transactions')
            .select('*, funding_accounts(name), savings_goals(name)')
            .in('account_id', accountIds)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;
        return data;
    }

    /**
     * Obtiene todas las transacciones de una cuenta específica
     * @param accountId - ID de la cuenta
     */
    async findByAccount(accountId: string) {
        const { data, error } = await this.supabase.getClient()
            .from('transactions')
            .select('*, savings_goals(name)')
            .eq('account_id', accountId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }


    async transferBetweenAccounts(dto: TransferDto) {
        const supabase = this.supabase.getAdminClient();

        // 1. Obtener y validar cuenta de origen (Saldo suficiente)
        const { data: fromAccount, error: fromError } = await supabase
            .from('funding_accounts')
            .select('balance, name')
            .eq('id', dto.fromAccountId)
            .single();

        if (fromError || !fromAccount) throw new NotFoundException('Cuenta de origen no encontrada');
        if (fromAccount.balance < dto.amount) throw new Error('Saldo insuficiente en la cuenta de origen');

        // 2. Obtener cuenta de destino
        const { data: toAccount, error: toError } = await supabase
            .from('funding_accounts')
            .select('balance, name')
            .eq('id', dto.toAccountId)
            .single();

        if (toError || !toAccount) throw new NotFoundException('Cuenta de destino no encontrada');

        // 3. Ejecutar las actualizaciones de balance
        // Restar de origen
        const { error: updateFromError } = await supabase
            .from('funding_accounts')
            .update({ balance: fromAccount.balance - dto.amount })
            .eq('id', dto.fromAccountId);

        if (updateFromError) throw updateFromError;

        // Sumar a destino
        const { error: updateToError } = await supabase
            .from('funding_accounts')
            .update({ balance: toAccount.balance + dto.amount })
            .eq('id', dto.toAccountId);

        if (updateToError) {
            // "Rollback" manual simple: Si falla el destino, devolvemos el dinero al origen
            await supabase.from('funding_accounts').update({ balance: fromAccount.balance }).eq('id', dto.fromAccountId);
            throw new Error('Error al acreditar en la cuenta destino');
        }

        // 4. Registrar la transacción en el historial (Opcional pero recomendado)
        const { data: transaction, error: txError } = await supabase
            .from('transactions')
            .insert({
                account_id: dto.fromAccountId,
                amount: dto.amount,
                type: 'transfer', // Debes asegurarte que este tipo exista en tu ENUM de base de datos
                description: `Transferencia a ${toAccount.name}`
            })
            .select()
            .single();

        if (txError) console.error("Error registrando log de transferencia:", txError);

        return {
            message: 'Transferencia realizada con éxito',
            newFromBalance: fromAccount.balance - dto.amount,
            transaction
        };
    }
}
