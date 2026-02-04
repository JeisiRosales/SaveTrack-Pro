import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';

@Injectable()
export class ExpenseCategoriesService {
  constructor(private supabase: SupabaseService) { }

  // Crear una nueva categoría de gastos
  async create(userId: string, createDto: CreateExpenseCategoryDto) {
    const { data, error } = await this.supabase.getAdminClient()
      .from('expense_categories')
      .insert({ user_id: userId, ...createDto })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Obtener todas las categorías de gastos del usuario
  async findAll(userId: string) {
    const { data, error } = await this.supabase.getAdminClient()
      .from('expense_categories')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Obtener una categoría de gastos por ID
  async findOne(id: string, userId: string) {
    const { data, error } = await this.supabase.getAdminClient()
      .from('expense_categories')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  // Actualizar una categoría de gastos
  async update(id: string, userId: string, updateDto: UpdateExpenseCategoryDto) {
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
    return data;
  }

  // Eliminar una categoría de gastos
  async remove(id: string, userId: string) {
    const { error } = await this.supabase.getAdminClient()
      .from('expense_categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }
}