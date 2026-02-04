import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateIncomeTransactionDto } from './dto/create-income-transaction.dto';

@Injectable()
export class IncomeTransactionsService {
  constructor(private supabase: SupabaseService) { }

  // Crear una transacción de ingreso
  async create(userId: string, createDto: CreateIncomeTransactionDto) {
    // Verificar que la cuenta pertenece al usuario
    const { data: account } = await this.supabase.getAdminClient()
      .from('funding_accounts')
      .select('id, balance')
      .eq('id', createDto.account_id)
      .eq('user_id', userId)
      .single();

    if (!account) {
      throw new BadRequestException('Account not found or unauthorized');
    }

    // Crear la transacción
    const { data, error } = await this.supabase.getAdminClient()
      .from('income_transactions')
      .insert(createDto)
      .select()
      .single();

    if (error) throw error;

    // Actualizar el balance de la cuenta
    await this.supabase.getAdminClient()
      .from('funding_accounts')
      .update({ balance: account.balance + createDto.amount })
      .eq('id', createDto.account_id);

    return data;
  }

  // Obtener todas las transacciones de ingreso
  async findAll(userId: string, accountId?: string) {
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
    return data;
  }

  // Obtener todas las transacciones de ingreso por cuenta
  async findAllByAccount(userId: string, accountId?: string) {
    const { data, error } = await this.supabase.getAdminClient()
      .from('income_transactions')
      .select(`
      *,
      funding_accounts!inner(user_id, name),
      income_categories(name)
      `)
      .eq('funding_accounts.user_id', userId)
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
  }

  // Obtener una transacción de ingreso por ID
  async findOne(id: string, userId: string) {
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
    return data;
  }
}