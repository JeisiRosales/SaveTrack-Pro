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

export const PERIOD_UNIT_PLURAL_LABELS: Record<BudgetPeriod, string> = {
    daily: 'días',
    weekly: 'semanas',
    biweekly: 'quincenas',
    monthly: 'meses',
    yearly: 'años',
};

export const PERIOD_THIS_PREFIX: Record<BudgetPeriod, string> = {
    daily: 'este',
    weekly: 'esta',
    biweekly: 'esta',
    monthly: 'este',
    yearly: 'este',
};

/**
 * Calcula el estado de la meta según el período configurado por el usuario.
 * Reemplaza la lógica anterior que era exclusivamente semanal.
 */
export const calculateWeeklyStatus = (
    goal: Goal,
    period: BudgetPeriod = 'weekly'
): WeeklyStatus => {
    // Calcular días UTC para evitar problemas de zona horaria y horario de verano
    const getUTCDays = (val: string | Date) => {
        let d: Date;
        if (typeof val === 'string' && val.length === 10 && val.includes('-')) {
            // Forzar 'YYYY-MM-DD' a interpretarse a la medianoche *local* (en reemplazo a la de UTC de JS)
            d = new Date(val.replace(/-/g, '/'));
        } else {
            d = new Date(val);
        }
        return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / (1000 * 60 * 60 * 24));
    };
    
    const startDateParam = goal.start_date || goal.created_at;
    const startDays = getUTCDays(startDateParam);
    const endDays = getUTCDays(goal.end_date);
    const todayDays = getUTCDays(new Date());

    const periodDays = PERIOD_DAYS[period];

    // Duración total en días
    const totalDaysDiff = Math.max(1, endDays - startDays);
    
    // Total de períodos
    const totalPeriods = Math.max(1, Math.ceil(totalDaysDiff / periodDays));

    // Días transcurridos
    const elapsedDays = Math.max(0, todayDays - startDays);
    
    // Períodos COMPLETADOS
    let completedPeriods = Math.floor(elapsedDays / periodDays);

    // Si pasamos la fecha final, todos los períodos están completados
    if (todayDays >= endDays) {
        completedPeriods = totalPeriods;
    } else {
        completedPeriods = Math.min(completedPeriods, totalPeriods - 1);
    }
    
    // El período actual en curso (1-indexed)
    const currentActivePeriod = Math.min(completedPeriods + 1, totalPeriods);

    const amountToSaveFromZero = goal.target_amount - (goal.initial_amount || 0);
    const periodInstallment = Math.max(0, amountToSaveFromZero / totalPeriods);

    // Lo que debe tener al final del período actual en curso
    let expectedForCurrentPeriod = (goal.initial_amount || 0) + (periodInstallment * currentActivePeriod);
    expectedForCurrentPeriod = Math.min(expectedForCurrentPeriod, goal.target_amount);

    // Saldo pendiente para estar al día en el período actual
    const balanceToStayOnTrack = Math.max(0, expectedForCurrentPeriod - goal.current_amount);

    // "Atrasado" si debe cualquier monto esperado, incluyendo el período actual
    const isBehind = balanceToStayOnTrack > 0;

    return {
        balanceToStayOnTrack,
        isBehind,
        balanceToPay: balanceToStayOnTrack, // Para retrocompatibilidad
        weeksElapsed: currentActivePeriod, // Ahora representa el período actual
        totalWeeksDuration: totalPeriods,
        weeklyInstallment: periodInstallment,
        weeksDuration: totalPeriods,
        expectedAccumulated: expectedForCurrentPeriod,
    };
};