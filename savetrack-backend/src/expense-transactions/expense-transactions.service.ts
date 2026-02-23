import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateExpenseTransactionDto } from './dto/create-expense-transaction.dto';
import { UpdateExpenseTransactionDto } from './dto/update-expense-transaction.dto';
import { ExpenseTransaction } from './entities/expense-transaction.entity';

@Injectable()
export class ExpenseTransactionsService {
  constructor(private supabase: SupabaseService) { }

  /**
   * Crear una transacción de gasto
   * @param userId - ID del usuario propietario
   * @param createDto - Datos de la transacción
   */
  async create(userId: string, createDto: CreateExpenseTransactionDto): Promise<ExpenseTransaction> {
    // Verificar que la cuenta pertenece al usuario
    const { data: account } = await this.supabase.getAdminClient()
      .from('funding_accounts')
      .select('id, balance')
      .eq('id', createDto.account_id)
      .eq('user_id', userId)
      .single();

    if (!account) {
      throw new BadRequestException('Cuenta no encontrada o no autorizado.');
    }

    // Verificar que hay suficiente balance
    if (account.balance < createDto.amount) {
      throw new BadRequestException('Balance insuficiente.');
    }

    // Crear la transacción
    const { data, error } = await this.supabase.getAdminClient()
      .from('expense_transactions')
      .insert(createDto)
      .select()
      .single();

    if (error) throw error;

    // Actualizar el balance de la cuenta
    await this.supabase.getAdminClient()
      .from('funding_accounts')
      .update({ balance: account.balance - createDto.amount })
      .eq('id', createDto.account_id);

    return data as ExpenseTransaction;
  }

  /**
   * Obtener todas las transacciones de gasto del usuario
   * @param userId - ID del usuario
   * @param accountId - (Opcional) Filtrar por cuenta específica
   */
  async findAll(userId: string, accountId?: string): Promise<ExpenseTransaction[]> {
    let query = this.supabase.getAdminClient()
      .from('expense_transactions')
      .select(`
        *,
        funding_accounts!inner(user_id, name),
        expense_categories(name, is_fixed)
      `)
      .eq('funding_accounts.user_id', userId);

    if (accountId) {
      query = query.eq('account_id', accountId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data as any[];
  }

  /**
   * Obtener una transacción de gasto por ID
   * @param id - ID de la transacción
   * @param userId - ID del usuario (para validación)
   */
  async findOne(id: string, userId: string): Promise<ExpenseTransaction> {
    const { data, error } = await this.supabase.getAdminClient()
      .from('expense_transactions')
      .select(`
        *,
        funding_accounts!inner(user_id, name),
        expense_categories(name, is_fixed)
      `)
      .eq('id', id)
      .eq('funding_accounts.user_id', userId)
      .single();

    if (error) throw error;
    return data as any;
  }

  /**
   * Actualizar una transacción de gasto
   * @param id - ID de la transacción
   * @param userId - ID del usuario (para validación)
   * @param updateDto - Datos a actualizar
   */
  async update(id: string, userId: string, updateDto: UpdateExpenseTransactionDto): Promise<ExpenseTransaction> {
    // Obtener la transacción actual para conocer el monto previo y la cuenta
    const { data: transaction, error: fetchError } = await this.supabase.getAdminClient()
      .from('expense_transactions')
      .select('*, funding_accounts!inner(user_id, balance)')
      .eq('id', id)
      .eq('funding_accounts.user_id', userId)
      .single();

    if (fetchError || !transaction) {
      throw new NotFoundException('Transacción no encontrada.');
    }

    // Seguridad: No permitir cambiar la cuenta (account_id)
    delete updateDto.account_id;

    // Si el monto cambió, actualizar el balance de la cuenta
    if (updateDto.amount !== undefined && updateDto.amount !== transaction.amount) {
      const diff = transaction.amount - updateDto.amount;
      const newAccountBalance = transaction.funding_accounts.balance + diff;

      if (newAccountBalance < 0) {
        throw new BadRequestException('Balance insuficiente en la cuenta para realizar este cambio.');
      }

      await this.supabase.getAdminClient()
        .from('funding_accounts')
        .update({ balance: newAccountBalance })
        .eq('id', transaction.account_id);
    }

    // Actualizar la transacción
    const { data, error } = await this.supabase.getAdminClient()
      .from('expense_transactions')
      .update(updateDto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ExpenseTransaction;
  }

  /**
   * Eliminar una transacción de gasto
   * @param id - ID de la transacción
   * @param userId - ID del usuario (para validación)
   */
  async remove(id: string, userId: string): Promise<{ message: string }> {
    // Obtener la transacción para conocer el monto y la cuenta
    const { data: transaction, error: fetchError } = await this.supabase.getAdminClient()
      .from('expense_transactions')
      .select('*, funding_accounts!inner(user_id, balance)')
      .eq('id', id)
      .eq('funding_accounts.user_id', userId)
      .single();

    if (fetchError || !transaction) {
      throw new NotFoundException('Transacción no encontrada.');
    }

    // Restaurar el balance de la cuenta (el gasto ya no existe)
    await this.supabase.getAdminClient()
      .from('funding_accounts')
      .update({ balance: transaction.funding_accounts.balance + transaction.amount })
      .eq('id', transaction.account_id);

    // Eliminar la transacción
    const { error: deleteError } = await this.supabase.getAdminClient()
      .from('expense_transactions')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return { message: 'Transacción eliminada correctamente' };
  }
}
