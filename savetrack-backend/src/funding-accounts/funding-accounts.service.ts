import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { FundingAccount } from './entities/funding-account.entity';

@Injectable()
export class FundingAccountsService {
    constructor(private supabase: SupabaseService) { }

    /**
     * Crea una nueva cuenta de financiamiento para el usuario
     * @param userId - ID del usuario propietario
     * @param dto - Datos de la cuenta (nombre y balance inicial)
     */
    async create(userId: string, dto: CreateAccountDto): Promise<FundingAccount> {
        const { data, error } = await this.supabase.getAdminClient()
            .from('funding_accounts')
            .insert({ user_id: userId, ...dto }) // Inserta con el user_id del usuario autenticado
            .select() // Retorna el registro creado
            .single(); // Espera un solo resultado

        if (error) throw error;
        return data as FundingAccount;
    }

    /**
     * Obtiene todas las cuentas del usuario
     * @param userId - ID del usuario
     */
    async findAll(userId: string): Promise<FundingAccount[]> {
        const { data, error } = await this.supabase.getAdminClient()
            .from('funding_accounts')
            .select('*')
            .eq('user_id', userId); // Filtra por user_id (RLS también lo valida)

        if (error) throw error;
        return data as FundingAccount[];
    }

    /**
     * Actualiza una cuenta existente
     * @param id - ID de la cuenta
     * @param userId - ID del usuario (para validación)
     * @param updates - Campos a actualizar
     */
    async update(id: string, userId: string, updates: Partial<CreateAccountDto>): Promise<FundingAccount> {
        const { data, error } = await this.supabase.getAdminClient()
            .from('funding_accounts')
            .update(updates)
            .eq('id', id)
            .eq('user_id', userId) // Asegura que solo el propietario pueda actualizar
            .select()
            .single();

        if (error) throw error;
        return data as FundingAccount;
    }

    /**
     * Elimina una cuenta
     * @param id - ID de la cuenta
     * @param userId - ID del usuario (para validación)
     */
    async delete(id: string, userId: string): Promise<void> {
        const { error } = await this.supabase.getAdminClient()
            .from('funding_accounts')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
    }
}
