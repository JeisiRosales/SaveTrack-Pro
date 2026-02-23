import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { FundingAccount } from './entities/funding-account.entity';
import { TransferDto } from './dto/transfer.dto';
import { Transaction } from 'src/transactions/entities/transaction.entity';

@Injectable()
export class FundingAccountsService {
    constructor(private supabase: SupabaseService) { }

    /**
     * Crea una nueva cuenta de financiamiento para el usuario
     * @param userId - ID del usuario propietario
     * @param dto - Datos de la cuenta (nombre y balance inicial)
     */
    async create(userId: string, dto: CreateAccountDto): Promise<FundingAccount> {
        const { data, error } = await this.supabase.getAdminClient()
            .from('funding_accounts')
            .insert({ user_id: userId, ...dto }) // Inserta con el user_id del usuario autenticado
            .select() // Retorna el registro creado
            .single(); // Espera un solo resultado

        if (error) throw error;
        return data as FundingAccount;
    }

    /**
     * Obtiene todas las cuentas del usuario
     * @param userId - ID del usuario
     */
    async findAll(userId: string): Promise<FundingAccount[]> {
        const { data, error } = await this.supabase.getAdminClient()
            .from('funding_accounts')
            .select('*')
            .eq('user_id', userId); // Filtra por user_id (RLS también lo valida)

        if (error) throw error;
        return data as FundingAccount[];
    }

    /**
     * Actualiza una cuenta existente
     * @param id - ID de la cuenta
     * @param userId - ID del usuario (para validación)
     * @param updates - Campos a actualizar
     */
    async update(id: string, userId: string, updates: Partial<CreateAccountDto>): Promise<FundingAccount> {
        const { data, error } = await this.supabase.getAdminClient()
            .from('funding_accounts')
            .update(updates)
            .eq('id', id)
            .eq('user_id', userId) // Asegura que solo el propietario pueda actualizar
            .select()
            .single();

        if (error) throw error;
        return data as FundingAccount;
    }

    /**
     * Elimina una cuenta
     * @param id - ID de la cuenta
     * @param userId - ID del usuario (para validación)
     */
    async delete(id: string, userId: string): Promise<{ message: string }> {
        const { error } = await this.supabase.getAdminClient()
            .from('funding_accounts')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;

        return {
            message: 'Cuenta eliminada correctamente',
        };
    }

    /**
     * Realiza una transferencia entre dos cuentas de financiamiento
     * @param dto - Datos de la transferencia (origen, destino, monto)
     */
    async transferBetweenAccounts(dto: TransferDto): Promise<{ message: string; newFromBalance: number; transaction: Transaction }> {
        const supabase = this.supabase.getAdminClient();

        // Obtener y validar cuenta de origen (Saldo suficiente)
        const { data: fromAccount, error: fromError } = await supabase
            .from('funding_accounts')
            .select('balance, name')
            .eq('id', dto.fromAccountId)
            .single();

        if (fromError || !fromAccount) throw new NotFoundException('Cuenta de origen no encontrada');
        if (fromAccount.balance < dto.amount) throw new Error('Saldo insuficiente en la cuenta de origen');

        // Obtener cuenta de destino
        const { data: toAccount, error: toError } = await supabase
            .from('funding_accounts')
            .select('balance, name')
            .eq('id', dto.toAccountId)
            .single();

        if (toError || !toAccount) throw new NotFoundException('Cuenta de destino no encontrada');

        // Ejecutar las actualizaciones de balance
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

        // Registrar la transacción en el historial
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
            transaction: transaction as Transaction
        };
    }

    /**
     * Obtiene todas las transacciones de una cuenta específica (Ahorros, Gastos e Ingresos)
     * @param account_id - ID de la cuenta
     */
    async findByAccount(account_id: string): Promise<any[]> {
        const supabase = this.supabase.getAdminClient();

        // 1. Obtener transacciones de Metas/Transferencias
        const { data: savings, error: savingsError } = await supabase
            .from('transactions')
            .select('*, savings_goals(name)')
            .eq('account_id', account_id);

        if (savingsError) throw savingsError;

        // 2. Obtener transacciones de Gastos
        const { data: expenses, error: expensesError } = await supabase
            .from('expense_transactions')
            .select('*, expense_categories(name)')
            .eq('account_id', account_id);

        if (expensesError) throw expensesError;

        // 3. Obtener transacciones de Ingresos
        const { data: incomes, error: incomesError } = await supabase
            .from('income_transactions')
            .select('*, income_categories(name)')
            .eq('account_id', account_id);

        if (incomesError) throw incomesError;

        // 4. Mapear y unificar con un discriminador 'main_type'
        const history = [
            ...savings.map(s => ({ ...s, main_type: 'saving' })),
            ...expenses.map(e => ({ ...e, main_type: 'expense' })),
            ...incomes.map(i => ({ ...i, main_type: 'income' }))
        ];

        // 5. Ordenar por fecha descendente
        return history.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }
}
