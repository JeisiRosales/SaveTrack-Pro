import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateFixedExpenseDto } from './dto/create-fixed-expense.dto';
import { UpdateFixedExpenseDto } from './dto/update-fixed-expense.dto';
import { FixedExpense } from './entities/fixed-expense.entity';

@Injectable()
export class FixedExpensesService {
  constructor(private supabase: SupabaseService) { }

  /**
   * Crear un compromiso de gasto fijo
   */
  async create(userId: string, createDto: CreateFixedExpenseDto): Promise<FixedExpense> {
    // 1. Verificar si ya existe un compromiso para esta categoría
    const { data: existing } = await this.supabase.getAdminClient()
      .from('fixed_expenses')
      .select('id')
      .eq('user_id', userId)
      .eq('category_id', createDto.category_id)
      .maybeSingle();

    if (existing) {
      // 2. Si existe, lo actualizamos
      return this.update(existing.id, userId, createDto);
    }

    // 3. Si no existe, lo creamos
    const { data, error } = await this.supabase.getAdminClient()
      .from('fixed_expenses')
      .insert({ ...createDto, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data as FixedExpense;
  }

  /**
   * Obtener todos los gastos fijos vinculándolos con transacciones reales del mes actual
   */
  async findAll(userId: string): Promise<FixedExpense[]> {
    // 1. Obtener compromisos activos
    const { data: commitments, error: commError } = await this.supabase.getAdminClient()
      .from('fixed_expenses')
      .select(`
        *,
        expense_categories(name)
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (commError) throw commError;

    // 2. Obtener transacciones del mes actual vinculadas
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: transactions } = await this.supabase.getAdminClient()
      .from('expense_transactions')
      .select('fixed_expense_id, amount, funding_accounts!inner(user_id)')
      .eq('funding_accounts.user_id', userId)
      .not('fixed_expense_id', 'is', null)
      .gte('created_at', startOfMonth.toISOString());

    const currentDay = new Date().getDate();
    const isPastBillingDate = currentDay > 0; // This should be vs comm.billing_day in real time

    // 3. Mapear resultados para la UI con nuevos estados
    return (commitments as any[]).map(comm => {
      // Sumar pagos realizados este mes para este compromiso
      const paidAmount = (transactions ?? [])
        .filter(t => t.fixed_expense_id === comm.id)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const targetAmount = Number(comm.amount);
      const isPaidFull = paidAmount >= targetAmount - 0.009; // Tolerancia para decimales

      let status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' = 'PENDING';
      if (isPaidFull) {
        status = 'PAID';
      } else if (paidAmount > 0) {
        // ¿Está atrasado aunque se haya pagado algo?
        if (currentDay > comm.billing_day) {
          status = 'OVERDUE';
        } else {
          status = 'PARTIAL';
        }
      } else if (currentDay > comm.billing_day) {
        status = 'OVERDUE';
      }

      return {
        ...comm,
        categoryName: comm.expense_categories?.name,
        paidAmount,
        isPaid: isPaidFull, // Retrocompatibilidad
        status
      };
    });
  }

  async update(id: string, userId: string, updateDto: UpdateFixedExpenseDto): Promise<FixedExpense> {
    const { data, error } = await this.supabase.getAdminClient()
      .from('fixed_expenses')
      .update(updateDto)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new NotFoundException('Gasto fijo no encontrado');
    return data as FixedExpense;
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const { error } = await this.supabase.getAdminClient()
      .from('fixed_expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return { message: 'Gasto fijo eliminado correctamente' };
  }

  /**
   * Obtener resumen de gastos fijos (Total, Pagado, Pendiente)
   */
  async getSummary(userId: string) {
    const expenses = await this.findAll(userId);
    
    // El total proyectado sigue siendo el total de compromisos
    const totalMonthly = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    
    // Lo pagado ahora es la suma exacta de los montos parciales
    const paidThisMonth = expenses.reduce((sum, e) => sum + (e.paidAmount || 0), 0);
    
    return {
      totalMonthly,
      paidThisMonth,
      pendingThisMonth: Math.max(0, totalMonthly - paidThisMonth),
      count: expenses.length
    };
  }
}
