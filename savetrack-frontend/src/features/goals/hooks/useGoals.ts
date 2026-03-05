import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as goalsApi from '../api/goals.api';
import { Goal } from '../types';
import { calculateWeeklyStatus } from '../utils/goal-calculations';

// hook para obtener las metas con React Query
export const useGoals = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const {
        data: goals = [],
        isLoading: loading,
        error: queryError,
        refetch: refreshGoals
    } = useQuery({
        queryKey: ['goals'],
        queryFn: async () => {
            const response = await goalsApi.getGoals();
            return response.data;
        }
    });

    const error = queryError ? "No se pudieron cargar tus metas. Por favor, intenta de nuevo." : null;

    // Cálculos globales
    const stats = useMemo(() => {
        const totalSaved = goals.reduce((acc: number, curr: Goal) => acc + (curr.current_amount || 0), 0);
        const totalWeeklyInstallments = goals.reduce((acc: number, goal: Goal) => {
            const status = calculateWeeklyStatus(goal);
            return acc + status.weeklyInstallment;
        }, 0);

        const globalStatus = goals.reduce((acc: any, goal: Goal) => {
            const status = calculateWeeklyStatus(goal);
            const isCompleted = (goal.current_amount || 0) >= (goal.target_amount || 0);

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
            .filter((goal: Goal) =>
                goal.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a: Goal, b: Goal) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());
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
        fetchGoals: refreshGoals
    };
};
