import { Goal, WeeklyStatus } from '../types';

// calcular estado semanal de la meta
export const calculateWeeklyStatus = (goal: Goal): WeeklyStatus => {
    const startDate = new Date(goal.created_at);
    const endDate = new Date(goal.end_date);
    const today = new Date();

    const weekInMs = 1000 * 60 * 60 * 24 * 7;

    // Duración Total en semanas
    const totalDiffInMs = endDate.getTime() - startDate.getTime();
    const weeksDuration = Math.max(1, Math.ceil(totalDiffInMs / weekInMs));

    // Semanas completadas hasta hoy (empezamos en 0 para la semana actual)
    const elapsedDiffInMs = today.getTime() - startDate.getTime();
    const weeksElapsed = Math.max(0, Math.floor(elapsedDiffInMs / weekInMs));

    // Cuota semanal FIJA basándose en lo que falta por ahorrar
    // (Monto Total - Monto Inicial) / Duración Total
    const amountToSaveFromZero = goal.target_amount - (goal.initial_amount || 0);
    const weeklyInstallment = Math.max(0, amountToSaveFromZero / weeksDuration);

    // Lo que debería tener hoy: Inicial + (Cuotas de semanas COMPLETADAS)
    // Usamos weeksElapsed (sin +1) para que el usuario tenga toda la semana actual para ahorrar.
    const expectedAccumulated = (goal.initial_amount || 0) + (weeklyInstallment * weeksElapsed);

    // Lo que le falta para estar al día
    const balanceToStayOnTrack = Math.max(0, expectedAccumulated - goal.current_amount);

    return {
        balanceToStayOnTrack,
        isBehind: goal.current_amount < expectedAccumulated,
        balanceToPay: balanceToStayOnTrack,
        weeksElapsed: weeksElapsed + 1, // Mostramos 1 para la primera semana
        totalWeeksDuration: weeksDuration,
        weeklyInstallment,
        weeksDuration,
        expectedAccumulated
    };
};
