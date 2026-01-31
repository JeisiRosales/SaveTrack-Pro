import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateUserSettingDto } from './dto/create-user-setting.dto';
import { UpdateUserSettingDto } from './dto/update-user-setting.dto';

@Injectable()
export class UserSettingsService {
  constructor(private supabase: SupabaseService) { }

  async create(userId: string, createDto: CreateUserSettingDto) {
    const { data, error } = await this.supabase.getAdminClient()
      .from('user_settings')
      .insert({ user_id: userId, ...createDto })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findByUserId(userId: string) {
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
          budget_period: 'monthly'
        });
      }
      throw error;
    }
    return data;
  }

  async update(userId: string, updateDto: UpdateUserSettingDto) {
    const { data, error } = await this.supabase.getAdminClient()
      .from('user_settings')
      .update(updateDto)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async remove(userId: string) {
    const { error } = await this.supabase.getAdminClient()
      .from('user_settings')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  }
}