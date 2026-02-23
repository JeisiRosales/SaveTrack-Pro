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

    // Crear la transacción de ingreso
    const { data, error } = await this.supabase.getAdminClient()
      .from('income_transactions')
      .insert(createDto)
      .select()
      .single();

    if (error) throw error;

    // Actualizar el balance de la cuenta receptora
    await this.supabase.getAdminClient()
      .from('funding_accounts')
      .update({ balance: account.balance + createDto.amount })
      .eq('id', createDto.account_id);

    // Lógica de AUTO-AHORRO
    try {
      const settings = await this.userSettingsService.findByUserId(userId);

      // Se ahorra si: el ahorro automático global está activo O si se solicita específicamente en esta transacción
      const shouldSave = settings.auto_save_enabled || createDto.perform_auto_save;

      if (shouldSave && settings.savings_account_id && settings.saving_percentage > 0) {
        const amountToSave = (createDto.amount * settings.saving_percentage) / 100;

        if (amountToSave > 0) {
          await this.fundingAccountsService.transferBetweenAccounts({
            fromAccountId: createDto.account_id,
            toAccountId: settings.savings_account_id,
            amount: amountToSave
          });
        }
      }
    } catch (saveError) {
      console.error('Error procesando el ahorro automático:', saveError);
      // No lanzamos error para no romper la creación del ingreso, pero lo logueamos
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
    return data as any[]; // data contains joined fields, might need a more complex type but any/IncomeTransaction works for current logic
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
    // Obtener la transacción actual para conocer el monto previo y la cuenta
    const { data: transaction, error: fetchError } = await this.supabase.getAdminClient()
      .from('income_transactions')
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
      const diff = updateDto.amount - transaction.amount;
      const newAccountBalance = transaction.funding_accounts.balance + diff;

      await this.supabase.getAdminClient()
        .from('funding_accounts')
        .update({ balance: newAccountBalance })
        .eq('id', transaction.account_id);
    }

    // Actualizar la transacción
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
    // Obtener la transacción para conocer el monto y la cuenta
    const { data: transaction, error: fetchError } = await this.supabase.getAdminClient()
      .from('income_transactions')
      .select('*, funding_accounts!inner(user_id, balance)')
      .eq('id', id)
      .eq('funding_accounts.user_id', userId)
      .single();

    if (fetchError || !transaction) {
      throw new NotFoundException('Transacción no encontrada.');
    }

    // Revertir el balance de la cuenta (el ingreso ya no existe)
    await this.supabase.getAdminClient()
      .from('funding_accounts')
      .update({ balance: transaction.funding_accounts.balance - transaction.amount })
      .eq('id', transaction.account_id);

    // Eliminar la transacción
    const { error: deleteError } = await this.supabase.getAdminClient()
      .from('income_transactions')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return { message: 'Transacción eliminada correctamente' };
  }
}