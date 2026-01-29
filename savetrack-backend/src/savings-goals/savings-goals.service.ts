import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { SavingsGoal } from './entities/savings-goal.entity';

@Injectable()
export class SavingsGoalsService {
    constructor(private supabase: SupabaseService) { }

    /**
     * Crea una nueva meta de ahorro
     * @param userId - ID del usuario propietario
     * @param dto - Datos de la meta
     */
    async create(userId: string, dto: CreateGoalDto): Promise<SavingsGoal> {
        const { data, error } = await this.supabase.getAdminClient()
            .from('savings_goals')
            .insert({
                user_id: userId,
                name: dto.name,
                target_amount: dto.targetAmount,
                initial_amount: dto.initialAmount || 0,
                current_amount: dto.initialAmount || 0, // El monto actual inicia igual al inicial
                start_date: dto.startDate,
                end_date: dto.endDate,
                image_url: dto.imageUrl,
            })
            .select()
            .single();

        if (error) throw error;
        return data as SavingsGoal;
    }

    /**
     * Obtiene todas las metas del usuario
     * Ordenadas por fecha de creación (más recientes primero)
     */
    async findAll(userId: string): Promise<SavingsGoal[]> {
        const { data, error } = await this.supabase.getAdminClient()
            .from('savings_goals')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false }); // Más recientes primero

        if (error) throw error;
        return data as SavingsGoal[];
    }

    /**
     * Obtiene una meta específica por ID
     * @param id - ID de la meta
     * @param userId - ID del usuario (para validación)
     */
    async findOne(id: string, userId: string): Promise<SavingsGoal> {
        const { data, error } = await this.supabase.getAdminClient()
            .from('savings_goals')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        return data as SavingsGoal;
    }

    /**
     * Actualiza una meta de ahorro
     * @param id - ID de la meta
     * @param dto - Datos a actualizar
     * @param userId - ID del usuario (para validación)
     */
    async update(id: string, dto: any, userId: string): Promise<SavingsGoal> {
        const { data, error } = await this.supabase.getAdminClient()
            .from('savings_goals')
            .update({
                name: dto.name,
                target_amount: dto.targetAmount,
                initial_amount: dto.initialAmount,
                start_date: dto.startDate,
                end_date: dto.endDate,
                image_url: dto.imageUrl,
            })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data as SavingsGoal;
    }

    /**
     * Elimina una meta de ahorro
     * @param id - ID de la meta
     * @param userId - ID del usuario (para validación)
     */
    async remove(id: string, userId: string): Promise<SavingsGoal> {
        const { data, error } = await this.supabase.getAdminClient()
            .from('savings_goals')
            .delete()
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data as SavingsGoal;
    }
}
