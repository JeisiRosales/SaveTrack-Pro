import { useState, useEffect, useMemo } from 'react';
import * as goalsApi from '../api/goals.api';
import { Goal } from '../types';
import { calculateWeeklyStatus } from '../utils/goal-calculations';

// hook para obtener las metas
export const useGoals = () => {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchGoals = async () => {
        try {
            setLoading(true);
            const response = await goalsApi.getGoals();
            setGoals(response.data);
            setError(null);
        } catch (err: any) {
            console.error("Error fetching goals:", err);
            setError("No se pudieron cargar tus metas. Por favor, intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    // refrescar las metas
    const refreshGoals = async () => {
        try {
            const response = await goalsApi.getGoals();
            setGoals(response.data);
        } catch (err) {
            console.error("Error refreshing goals:", err);
        }
    };

    // Cálculos globales
    const stats = useMemo(() => {
        const totalSaved = goals.reduce((acc, curr) => acc + (curr.current_amount || 0), 0);
        const totalWeeklyInstallments = goals.reduce((acc, goal) => {
            const status = calculateWeeklyStatus(goal);
            return acc + status.weeklyInstallment;
        }, 0);

        const globalStatus = goals.reduce((acc, goal) => {
            const status = calculateWeeklyStatus(goal);
            const isCompleted = goal.current_amount >= goal.target_amount;

            if (!isCompleted) {
                acc.totalBalanceToPay += status.balanceToStayOnTrack;
                if (status.isBehind) acc.anyGoalBehind = true;
                acc.activeGoalsCount += 1;
            } else {
                acc.completedGoalsCount += 1;
            }
            return acc;
        }, { totalBalanceToPay: 0, anyGoalBehind: false, activeGoalsCount: 0, completedGoalsCount: 0 });

        return {
            totalSaved,
            totalWeeklyInstallments,
            ...globalStatus
        };
    }, [goals]);

    const filteredGoals = useMemo(() => {
        return goals
            .filter((goal) =>
                goal.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());
    }, [goals, searchTerm]);

    return {
        goals,
        filteredGoals,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        stats,
        refreshGoals,
        fetchGoals
    };
};
