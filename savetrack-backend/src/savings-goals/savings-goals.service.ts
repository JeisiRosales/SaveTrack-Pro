import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateGoalDto } from './dto/create-goal.dto';

@Injectable()
export class SavingsGoalsService {
    constructor(private supabase: SupabaseService) { }

    /**
     * Crea una nueva meta de ahorro
     * @param userId - ID del usuario propietario
     * @param dto - Datos de la meta
     */
    async create(userId: string, dto: CreateGoalDto) {
        const { data, error } = await this.supabase.getClient()
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
        return data;
    }

    /**
     * Obtiene todas las metas del usuario
     * Ordenadas por fecha de creación (más recientes primero)
     */
    async findAll(userId: string) {
        const { data, error } = await this.supabase.getClient()
            .from('savings_goals')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false }); // Más recientes primero

        if (error) throw error;
        return data;
    }

    /**
     * Obtiene una meta específica por ID
     * @param id - ID de la meta
     * @param userId - ID del usuario (para validación)
     */
    async findOne(id: string, userId: string) {
        const { data, error } = await this.supabase.getClient()
            .from('savings_goals')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Sube una imagen al bucket de Supabase Storage y actualiza la meta
     * @param id - ID de la meta
     * @param file - Archivo de imagen
     * @param userId - ID del usuario
     * @returns URL pública de la imagen
     */
    async uploadImage(id: string, file: Express.Multer.File, userId: string) {
        // Genera un nombre único para el archivo: userId/timestamp-nombreOriginal
        const fileName = `${userId}/${Date.now()}-${file.originalname}`;

        const { data: uploadData, error: uploadError } = await this.supabase.getClient()
            .storage
            .from('goal-images')
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
            });

        if (uploadError) throw uploadError;

        // Obtiene la URL pública de la imagen subida
        const { data: { publicUrl } } = this.supabase.getClient()
            .storage
            .from('goal-images')
            .getPublicUrl(fileName);

        // Actualiza el campo image_url en la base de datos
        const { error: updateError } = await this.supabase.getClient()
            .from('savings_goals')
            .update({ image_url: publicUrl })
            .eq('id', id)
            .eq('user_id', userId);

        if (updateError) throw updateError;

        return { imageUrl: publicUrl };
    }

    /**
     * Calcula las métricas de salud y progreso de una meta
     * @param goal - Objeto de la meta de ahorro
     * @returns Métricas calculadas
     */
    calculateGoalHealth(goal: any) {
        const today = new Date();
        const startDate = new Date(goal.start_date);
        const endDate = new Date(goal.end_date);

        // Cálculo de tiempo
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const elapsedDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const remainingDays = totalDays - elapsedDays;
        const remainingWeeks = Math.ceil(remainingDays / 7);

        // Cálculo de progreso esperado vs. real
        const targetProgress = (elapsedDays / totalDays) * goal.target_amount; // Cuánto DEBERÍAS tener hoy
        const actualProgress = goal.current_amount; // Cuánto TIENES realmente
        const healthPercentage = (actualProgress / targetProgress) * 100; // Salud: 100% = bien, <100% = atrasado

        // Cálculo de cuotas requeridas
        const remainingAmount = goal.target_amount - goal.current_amount; // Falta por ahorrar
        const dailyRequired = remainingAmount / remainingDays; // Cuota diaria necesaria
        const weeklyRequired = dailyRequired * 7; // Cuota semanal
        const monthlyRequired = dailyRequired * 30; // Cuota mensual (aproximada)

        return {
            totalDays,
            elapsedDays,
            remainingDays,
            remainingWeeks,
            targetProgress, // Progreso esperado a la fecha
            actualProgress, // Progreso real
            healthPercentage, // Porcentaje de salud (100% = en tiempo, >100% = adelantado)
            dailyRequired, // Ahorro diario necesario
            weeklyRequired, // Ahorro semanal necesario
            monthlyRequired, // Ahorro mensual necesario
        };
    }

    /**
     * Actualiza una meta de ahorro
     * @param id - ID de la meta
     * @param dto - Datos a actualizar
     * @param userId - ID del usuario (para validación)
     */
    async update(id: string, dto: any, userId: string) {
        const { data, error } = await this.supabase.getClient()
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
        return data;
    }

    /**
     * Elimina una meta de ahorro
     * @param id - ID de la meta
     * @param userId - ID del usuario (para validación)
     */
    async remove(id: string, userId: string) {
        const { data, error } = await this.supabase.getClient()
            .from('savings_goals')
            .delete()
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
