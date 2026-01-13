import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateAccountDto } from './dto/create-account.dto';

@Injectable()
export class FundingAccountsService {
    constructor(private supabase: SupabaseService) { }

    /**
     * Crea una nueva cuenta de financiamiento para el usuario
     * @param userId - ID del usuario propietario
     * @param dto - Datos de la cuenta (nombre y balance inicial)
     */
    async create(userId: string, dto: CreateAccountDto) {
        const { data, error } = await this.supabase.getAdminClient()
            .from('funding_accounts')
            .insert({ user_id: userId, ...dto }) // Inserta con el user_id del usuario autenticado
            .select() // Retorna el registro creado
            .single(); // Espera un solo resultado

        if (error) throw error;
        return data;
    }

    /**
     * Obtiene todas las cuentas del usuario
     * @param userId - ID del usuario
     */
    async findAll(userId: string) {
        const { data, error } = await this.supabase.getAdminClient()
            .from('funding_accounts')
            .select('*')
            .eq('user_id', userId); // Filtra por user_id (RLS también lo valida)

        if (error) throw error;
        return data;
    }

    /**
     * Actualiza una cuenta existente
     * @param id - ID de la cuenta
     * @param userId - ID del usuario (para validación)
     * @param updates - Campos a actualizar
     */
    async update(id: string, userId: string, updates: Partial<CreateAccountDto>) {
        const { data, error } = await this.supabase.getAdminClient()
            .from('funding_accounts')
            .update(updates)
            .eq('id', id)
            .eq('user_id', userId) // Asegura que solo el propietario pueda actualizar
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Elimina una cuenta
     * @param id - ID de la cuenta
     * @param userId - ID del usuario (para validación)
     */
    async delete(id: string, userId: string) {
        const { error } = await this.supabase.getAdminClient()
            .from('funding_accounts')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
    }
}
