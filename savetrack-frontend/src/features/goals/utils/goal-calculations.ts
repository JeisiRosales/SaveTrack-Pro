import { Goal, WeeklyStatus } from '../types';

// calcular estado semanal de la meta
export const calculateWeeklyStatus = (goal: Goal): WeeklyStatus => {
    const startDate = new Date(goal.created_at);
    const endDate = new Date(goal.end_date);
    const today = new Date();

    // Semanas que han pasado desde el inicio hasta hoy
    const diffInMs = today.getTime() - startDate.getTime();
    const weeksElapsed = Math.max(1, Math.ceil(diffInMs / (1000 * 60 * 60 * 24 * 7)));

    // Cuota semanal FIJA (Monto Total / Duración Total de la meta)
    const totalWeeksDuration = endDate.getTime() - startDate.getTime();
    const weeksDuration = Math.max(1, Math.ceil(totalWeeksDuration / (1000 * 60 * 60 * 24 * 7)));
    const weeklyInstallment = goal.target_amount / weeksDuration;

    // Lo que el usuario debería tener ahorrado ACUMULADO hasta esta semana
    const expectedAccumulated = weeklyInstallment * weeksElapsed;

    // Lo que le falta para estar al día (Deuda acumulada + cuota actual)
    const balanceToStayOnTrack = Math.max(0, expectedAccumulated - goal.current_amount);

    return {
        balanceToStayOnTrack,
        isBehind: goal.current_amount < expectedAccumulated,
        balanceToPay: balanceToStayOnTrack,
        weeksElapsed,
        totalWeeksDuration,
        weeklyInstallment,
        weeksDuration,
        expectedAccumulated
    };
};
