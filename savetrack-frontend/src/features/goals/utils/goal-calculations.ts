import { Goal, WeeklyStatus } from '../types';

export type BudgetPeriod = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

// Duración de cada período en días
const PERIOD_DAYS: Record<BudgetPeriod, number> = {
    daily: 1,
    weekly: 7,
    biweekly: 14,
    monthly: 30,
    yearly: 365,
};

// Etiquetas en español para mostrar en la UI
export const PERIOD_LABELS: Record<BudgetPeriod, string> = {
    daily: 'diariamente',
    weekly: 'semanalmente',
    biweekly: 'quincenalmente',
    monthly: 'mensualmente',
    yearly: 'anualmente',
};

// Etiqueta de la cuota (ej: "cuota semanal", "cuota mensual")
export const PERIOD_INSTALLMENT_LABELS: Record<BudgetPeriod, string> = {
    daily: 'cuota diaria',
    weekly: 'cuota semanal',
    biweekly: 'cuota quincenal',
    monthly: 'cuota mensual',
    yearly: 'cuota anual',
};

// Etiqueta de período en singular (ej: "semana X de Y", "mes X de Y")
export const PERIOD_UNIT_LABELS: Record<BudgetPeriod, string> = {
    daily: 'día',
    weekly: 'semana',
    biweekly: 'quincena',
    monthly: 'mes',
    yearly: 'año',
};

/**
 * Calcula el estado de la meta según el período configurado por el usuario.
 * Reemplaza la lógica anterior que era exclusivamente semanal.
 */
export const calculateWeeklyStatus = (
    goal: Goal,
    period: BudgetPeriod = 'weekly'
): WeeklyStatus => {
    const startDate = new Date(goal.created_at);
    const endDate = new Date(goal.end_date);
    const today = new Date();

    const periodDays = PERIOD_DAYS[period];
    const periodInMs = 1000 * 60 * 60 * 24 * periodDays;

    // Duración total en períodos
    const totalDiffInMs = endDate.getTime() - startDate.getTime();
    const totalPeriods = Math.max(1, Math.ceil(totalDiffInMs / periodInMs));

    // Períodos transcurridos hasta hoy (sin contar el período actual en curso)
    const elapsedDiffInMs = today.getTime() - startDate.getTime();
    let periodsElapsed = Math.max(0, Math.floor(elapsedDiffInMs / periodInMs));
    periodsElapsed = Math.min(periodsElapsed, totalPeriods);

    // Cuota fija por período: (meta - monto inicial) / total de períodos
    const amountToSaveFromZero = goal.target_amount - (goal.initial_amount || 0);
    const periodInstallment = Math.max(0, amountToSaveFromZero / totalPeriods);

    // Lo que debería tener hasta hoy: inicial + (cuotas de períodos COMPLETADOS)
    // No sumamos el período actual para darle al usuario todo el período vigente
    let expectedAccumulated = (goal.initial_amount || 0) + (periodInstallment * periodsElapsed);
    expectedAccumulated = Math.min(expectedAccumulated, goal.target_amount);

    // Saldo pendiente para estar al día
    const balanceToStayOnTrack = Math.max(0, expectedAccumulated - goal.current_amount);

    return {
        balanceToStayOnTrack,
        isBehind: goal.current_amount < expectedAccumulated,
        balanceToPay: balanceToStayOnTrack,
        // Mantenemos los campos "weeks" para compatibilidad, pero ahora representan el período configurado
        weeksElapsed: Math.min(periodsElapsed + 1, totalPeriods),
        totalWeeksDuration: totalPeriods,
        weeklyInstallment: periodInstallment,
        weeksDuration: totalPeriods,
        expectedAccumulated,
    };
};