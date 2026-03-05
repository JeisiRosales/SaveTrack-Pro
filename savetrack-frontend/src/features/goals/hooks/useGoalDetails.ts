import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as goalsApi from '../api/goals.api';
import { Goal, GoalFormData } from '../types';

// hook para obtener los detalles de una meta
export const useGoalDetails = (id: string | undefined) => {
    const [goal, setGoal] = useState<Goal | null>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // obtener los detalles de una meta
    const fetchGoalData = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const [goalRes, transactionsRes] = await Promise.all([
                goalsApi.getGoal(id),
                goalsApi.getGoalTransactions(id)
            ]);
            setGoal(goalRes.data);
            setTransactions(transactionsRes.data);
            setError(null);
        } catch (err: any) {
            console.error("Error fetching goal details:", err);
            setError("No se pudo cargar la información de la meta.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoalData();
    }, [id]);

    // actualizar una meta
    const handleUpdateGoal = async (data: Partial<GoalFormData>) => {
        if (!id) return;
        try {
            const response = await goalsApi.updateGoal(id, data);
            setGoal(response.data);
            // Invalidar caché de la lista de metas
            queryClient.invalidateQueries({ queryKey: ['goals'] });
            return response.data;
        } catch (err) {
            console.error("Error updating goal:", err);
            throw err;
        }
    };

    // eliminar una meta
    const handleDeleteGoal = async () => {
        if (!id) return;
        try {
            await goalsApi.deleteGoal(id);
            // Invalidar caché de la lista de metas
            queryClient.invalidateQueries({ queryKey: ['goals'] });
        } catch (err) {
            console.error("Error deleting goal:", err);
            throw err;
        }
    };

    return {
        goal,
        transactions,
        loading,
        error,
        handleUpdateGoal,
        handleDeleteGoal,
        refresh: fetchGoalData
    };
};
