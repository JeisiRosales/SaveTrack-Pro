import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';
import { ExpenseCategory } from './entities/expense-category.entity';

@Injectable()
export class ExpenseCategoriesService {
  constructor(private supabase: SupabaseService) { }

  /**
   * Crear una nueva categoría de gastos
   * @param userId - ID del usuario propietario
   * @param createDto - Datos de la categoría
   */
  async create(userId: string, createDto: CreateExpenseCategoryDto): Promise<ExpenseCategory> {
    const { data, error } = await this.supabase.getAdminClient()
      .from('expense_categories')
      .insert({ user_id: userId, ...createDto })
      .select()
      .single();

    if (error) throw error;
    return data as ExpenseCategory;
  }

  /**
   * Obtener todas las categorías de gastos del usuario
   * @param userId - ID del usuario
   */
  async findAll(userId: string): Promise<ExpenseCategory[]> {
    const { data, error } = await this.supabase.getAdminClient()
      .from('expense_categories')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data as ExpenseCategory[];
  }

  /**
   * Obtener una categoría de gastos por ID
   * @param id - ID de la categoría
   * @param userId - ID del usuario (para validación)
   */
  async findOne(id: string, userId: string): Promise<ExpenseCategory> {
    const { data, error } = await this.supabase.getAdminClient()
      .from('expense_categories')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data as ExpenseCategory;
  }

  /**
   * Actualizar una categoría de gastos
   * @param id - ID de la categoría
   * @param userId - ID del usuario (para validación)
   * @param updateDto - Datos a actualizar
   */
  async update(id: string, userId: string, updateDto: UpdateExpenseCategoryDto): Promise<ExpenseCategory> {
    if (updateDto.name) {
      const { data: existingCategories } = await this.supabase.getAdminClient()
        .from('expense_categories')
        .select('id')
        .eq('user_id', userId)
        .eq('name', updateDto.name)
        .neq('id', id);

      if (existingCategories && existingCategories.length > 0) {
        throw new BadRequestException('Ya existe una categoría con ese nombre.');
      }
    }

    const { data, error } = await this.supabase.getAdminClient()
      .from('expense_categories')
      .update(updateDto)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as ExpenseCategory;
  }

  /**
   * Eliminar una categoría de gastos
   * @param id - ID de la categoría
   * @param userId - ID del usuario (para validación)
   */
  async remove(id: string, userId: string): Promise<{ message: string }> {
    // Intentamos eliminar asegurándonos de que pertenezca al usuario
    const { data, error, count } = await this.supabase.getAdminClient()
      .from('expense_categories')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    // Si no se eliminó ninguna fila (count === 0), significa que no existía o no pertenecía al usuario
    if (count === 0) {
      throw new NotFoundException('La categoría no existe o no tienes permiso para eliminarla.');
    }

    return {
      message: 'Categoría eliminada correctamente',
    };
  }
}
