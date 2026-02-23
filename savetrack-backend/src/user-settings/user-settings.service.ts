import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateUserSettingDto } from './dto/create-user-setting.dto';
import { UpdateUserSettingDto } from './dto/update-user-setting.dto';
import { UserSetting } from './entities/user-setting.entity';

@Injectable()
export class UserSettingsService {
  constructor(private supabase: SupabaseService) { }

  /**
   * Crear configuraciones de usuario
   * @param userId - ID del usuario
   * @param createDto - Datos de configuración inicial
   */
  async create(userId: string, createDto: CreateUserSettingDto): Promise<UserSetting> {
    const { data, error } = await this.supabase.getAdminClient()
      .from('user_settings')
      .insert({ user_id: userId, ...createDto })
      .select()
      .single();

    if (error) throw error;
    return data as UserSetting;
  }

  /**
   * Buscar configuraciones de usuario por ID de usuario
   * Si no existen, se crean con valores por defecto.
   * @param userId - ID del usuario
   */
  async findByUserId(userId: string): Promise<UserSetting> {
    const { data, error } = await this.supabase.getAdminClient()
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Si no existen configuraciones, las creamos con valores por defecto
        console.log(`No settings found for user ${userId}, creating defaults...`);
        return this.create(userId, {
          base_currency: 'USD',
          saving_percentage: 20,
          budget_period: 'monthly',
          monthly_income_target: 0.00,
          monthly_expense_budget: 0.00,
          auto_save_enabled: false
        } as any);
      }
      throw error;
    }
    return data as UserSetting;
  }

  /**
   * Actualizar configuraciones de usuario
   * @param userId - ID del usuario
   * @param updateDto - Datos a actualizar
   */
  async update(userId: string, updateDto: UpdateUserSettingDto): Promise<UserSetting> {
    const { data, error } = await this.supabase.getAdminClient()
      .from('user_settings')
      .update(updateDto)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as UserSetting;
  }
}