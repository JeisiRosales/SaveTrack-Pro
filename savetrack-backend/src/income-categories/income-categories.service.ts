import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateIncomeCategoryDto } from './dto/create-income-category.dto';
import { UpdateIncomeCategoryDto } from './dto/update-income-category.dto';
import { IncomeCategory } from './entities/income-category.entity';

@Injectable()
export class IncomeCategoriesService {
  constructor(private supabase: SupabaseService) { }

  /**
   * Crear categoría de ingresos
   * @param userId - ID del usuario propietario
   * @param createDto - Datos de la categoría
   */
  async create(userId: string, createDto: CreateIncomeCategoryDto): Promise<IncomeCategory> {
    const { data, error } = await this.supabase.getAdminClient()
      .from('income_categories')
      .insert({ user_id: userId, ...createDto })
      .select()
      .single();

    if (error) throw error;
    return data as IncomeCategory;
  }

  /**
   * Buscar todas las categorías de ingresos
   * @param userId - ID del usuario
   */
  async findAll(userId: string): Promise<IncomeCategory[]> {
    const { data, error } = await this.supabase.getAdminClient()
      .from('income_categories')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data as IncomeCategory[];
  }

  /**
   * Buscar una categoría de ingresos por ID
   * @param id - ID de la categoría
   * @param userId - ID del usuario (para validación)
   */
  async findOne(id: string, userId: string): Promise<IncomeCategory> {
    const { data, error } = await this.supabase.getAdminClient()
      .from('income_categories')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data as IncomeCategory;
  }

  /**
   * Actualizar categoría de ingresos
   * @param id - ID de la categoría
   * @param userId - ID del usuario (para validación)
   * @param updateDto - Datos a actualizar
   */
  async update(id: string, userId: string, updateDto: UpdateIncomeCategoryDto): Promise<IncomeCategory> {
    if (updateDto.name) {
      const { data: existingCategories } = await this.supabase.getAdminClient()
        .from('income_categories')
        .select('id')
        .eq('user_id', userId)
        .eq('name', updateDto.name)
        .neq('id', id);

      if (existingCategories && existingCategories.length > 0) {
        throw new BadRequestException('Ya existe una categoría con ese nombre.');
      }
    }
    const { data, error } = await this.supabase.getAdminClient()
      .from('income_categories')
      .update(updateDto)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as IncomeCategory;
  }

  /**
   * Eliminar categoría de ingresos
   * @param id - ID de la categoría
   * @param userId - ID del usuario (para validación)
   */
  async remove(id: string, userId: string): Promise<{ message: string }> {
    const { error } = await this.supabase.getAdminClient()
      .from('income_categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return { message: 'Categoría eliminada correctamente.' };
  }
}
