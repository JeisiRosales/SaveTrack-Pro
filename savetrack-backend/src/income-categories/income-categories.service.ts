import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateIncomeCategoryDto } from './dto/create-income-category.dto';
import { UpdateIncomeCategoryDto } from './dto/update-income-category.dto';

@Injectable()
export class IncomeCategoriesService {
  constructor(private supabase: SupabaseService) { }

  // Crear categoría de ingresos
  async create(userId: string, createDto: CreateIncomeCategoryDto) {
    const { data, error } = await this.supabase.getAdminClient()
      .from('income_categories')
      .insert({ user_id: userId, ...createDto })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Crear múltiples categorías de ingresos
  async createMany(userId: string, createDtos: CreateIncomeCategoryDto[]) {
    // Preparar datos para inserción masiva
    const dataToInsert = createDtos.map(dto => ({
      user_id: userId,
      ...dto
    }));

    const { data, error } = await this.supabase.getAdminClient()
      .from('income_categories')
      .insert(dataToInsert)
      .select();

    if (error) throw error;
    return data;
  }

  // Buscar todas las categorías de ingresos
  async findAll(userId: string) {
    const { data, error } = await this.supabase.getAdminClient()
      .from('income_categories')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Buscar una categoría de ingresos
  async findOne(id: string, userId: string) {
    const { data, error } = await this.supabase.getAdminClient()
      .from('income_categories')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  // Actualizar categoría de ingresos
  async update(id: string, userId: string, updateDto: UpdateIncomeCategoryDto) {
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
    return data;
  }

  // Eliminar categoría de ingresos
  async remove(id: string, userId: string) {
    const { error } = await this.supabase.getAdminClient()
      .from('income_categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }
}