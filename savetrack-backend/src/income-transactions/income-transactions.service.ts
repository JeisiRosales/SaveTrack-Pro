import { Injectable, BadRequestException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateIncomeTransactionDto } from './dto/create-income-transaction.dto';
import { UpdateIncomeTransactionDto } from './dto/update-income-transaction.dto';
import { IncomeTransaction } from './entities/income-transaction.entity';
import { UserSettingsService } from '../user-settings/user-settings.service';
import { FundingAccountsService } from '../funding-accounts/funding-accounts.service';

@Injectable()
export class IncomeTransactionsService {
  constructor(
    private supabase: SupabaseService,
    private userSettingsService: UserSettingsService,
    private fundingAccountsService: FundingAccountsService,
  ) { }

  /**
   * Crear una transacción de ingreso
   * @param userId - ID del usuario propietario
   * @param createDto - Datos de la transacción
   */
  async create(userId: string, createDto: CreateIncomeTransactionDto): Promise<IncomeTransaction> {
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

    // Separar perform_auto_save del resto — no es un campo de la tabla
    const { perform_auto_save, ...insertDto } = createDto;

    // Crear la transacción de ingreso
    const { data, error } = await this.supabase.getAdminClient()
      .from('income_transactions')
      .insert(insertDto)
      .select()
      .single();

    if (error) throw error;

    // Lógica de AUTO-AHORRO
    // Solo aplica si perform_auto_save no fue explícitamente desactivado (false)
    let amountToSave = 0;
    try {
      const settings = await this.userSettingsService.findByUserId(userId);

      // Si el frontend pasa perform_auto_save: false, no aplicar aunque esté activo globalmente
      const shouldSave = perform_auto_save === false
        ? false
        : (settings.auto_save_enabled || perform_auto_save === true);

      if (shouldSave && settings.savings_account_id) {
        const activePercentage = settings.saving_percentage > 0 ? settings.saving_percentage : 10;
        amountToSave = (createDto.amount * activePercentage) / 100;
      }
    } catch (saveError) {
      console.error('Error calculando el ahorro automático:', saveError);
    }

    const netAmount = createDto.amount - amountToSave;

    // Acreditar solo el neto a la cuenta origen (ingreso - ahorro)
    await this.supabase.getAdminClient()
      .from('funding_accounts')
      .update({ balance: account.balance + netAmount })
      .eq('id', createDto.account_id);

    // Acreditar el ahorro directamente a la cuenta de ahorros (sin transferencia entre cuentas)
    if (amountToSave > 0) {
      try {
        const settings = await this.userSettingsService.findByUserId(userId);

        const { data: savingsAccount } = await this.supabase.getAdminClient()
          .from('funding_accounts')
          .select('id, balance')
          .eq('id', settings.savings_account_id)
          .single();

        if (savingsAccount) {
          await this.supabase.getAdminClient()
            .from('funding_accounts')
            .update({ balance: savingsAccount.balance + amountToSave })
            .eq('id', settings.savings_account_id);
        }
      } catch (saveError) {
        console.error('Error acreditando el ahorro automático:', saveError);
      }
    }

    return data as IncomeTransaction;
  }

  /**
   * Obtener todas las transacciones de ingreso del usuario
   * @param userId - ID del usuario
   * @param accountId - (Opcional) Filtrar por cuenta específica
   */
  async findAll(userId: string, accountId?: string): Promise<IncomeTransaction[]> {
    let query = this.supabase.getAdminClient()
      .from('income_transactions')
      .select(`
        *,
        funding_accounts!inner(user_id, name),
        income_categories(name)
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
   * Obtener una transacción de ingreso por ID
   * @param id - ID de la transacción
   * @param userId - ID del usuario (para validación)
   */
  async findOne(id: string, userId: string): Promise<IncomeTransaction> {
    const { data, error } = await this.supabase.getAdminClient()
      .from('income_transactions')
      .select(`
        *,
        funding_accounts!inner(user_id, name),
        income_categories(name)
      `)
      .eq('id', id)
      .eq('funding_accounts.user_id', userId)
      .single();

    if (error) throw error;
    return data as any;
  }

  /**
   * Actualizar una transacción de ingreso
   * @param id - ID de la transacción
   * @param userId - ID del usuario (para validación)
   * @param updateDto - Datos a actualizar
   */
  async update(id: string, userId: string, updateDto: UpdateIncomeTransactionDto): Promise<IncomeTransaction> {
    const { data: transaction, error: fetchError } = await this.supabase.getAdminClient()
      .from('income_transactions')
      .select('*, funding_accounts!inner(user_id, balance)')
      .eq('id', id)
      .eq('funding_accounts.user_id', userId)
      .single();

    if (fetchError || !transaction) {
      throw new NotFoundException('Transacción no encontrada.');
    }

    delete updateDto.account_id;

    if (updateDto.amount !== undefined && updateDto.amount !== transaction.amount) {
      const diff = updateDto.amount - transaction.amount;
      const newAccountBalance = transaction.funding_accounts.balance + diff;

      await this.supabase.getAdminClient()
        .from('funding_accounts')
        .update({ balance: newAccountBalance })
        .eq('id', transaction.account_id);
    }

    const { data, error } = await this.supabase.getAdminClient()
      .from('income_transactions')
      .update(updateDto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as IncomeTransaction;
  }

  /**
   * Eliminar una transacción de ingreso
   * @param id - ID de la transacción
   * @param userId - ID del usuario (para validación)
   */
  async remove(id: string, userId: string): Promise<{ message: string }> {
    const { data: transaction, error: fetchError } = await this.supabase.getAdminClient()
      .from('income_transactions')
      .select('*, funding_accounts!inner(user_id, balance)')
      .eq('id', id)
      .eq('funding_accounts.user_id', userId)
      .single();

    if (fetchError || !transaction) {
      throw new NotFoundException('Transacción no encontrada.');
    }

    await this.supabase.getAdminClient()
      .from('funding_accounts')
      .update({ balance: transaction.funding_accounts.balance - transaction.amount })
      .eq('id', transaction.account_id);

    const { error: deleteError } = await this.supabase.getAdminClient()
      .from('income_transactions')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return { message: 'Transacción eliminada correctamente' };
  }
}