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
    // Limitar elapsedWeeks a la duración total de la meta
    let weeksElapsed = Math.max(0, Math.floor(elapsedDiffInMs / weekInMs));
    weeksElapsed = Math.min(weeksElapsed, weeksDuration);

    // Cuota semanal FIJA basándose en lo que falta por ahorrar
    // (Monto Total - Monto Inicial) / Duración Total
    const amountToSaveFromZero = goal.target_amount - (goal.initial_amount || 0);
    const weeklyInstallment = Math.max(0, amountToSaveFromZero / weeksDuration);

    // Lo que debería tener hoy: Inicial + (Cuotas de semanas COMPLETADAS)
    // Usamos weeksElapsed (sin +1) para que el usuario tenga toda la semana actual para ahorrar.
    // Limitar lo esperado al monto objetivo máximo
    let expectedAccumulated = (goal.initial_amount || 0) + (weeklyInstallment * weeksElapsed);
    expectedAccumulated = Math.min(expectedAccumulated, goal.target_amount);

    // Lo que le falta para estar al día
    const balanceToStayOnTrack = Math.max(0, expectedAccumulated - goal.current_amount);

    return {
        balanceToStayOnTrack,
        isBehind: goal.current_amount < expectedAccumulated,
        balanceToPay: balanceToStayOnTrack,
        weeksElapsed: Math.min(weeksElapsed + 1, weeksDuration), // Limitar semanas mostradas al máximo de la meta
        totalWeeksDuration: weeksDuration,
        weeklyInstallment,
        weeksDuration,
        expectedAccumulated
    };
};
