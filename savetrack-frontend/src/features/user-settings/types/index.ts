/**
 * Preferencias globales y configuraciones vitales del usuario actual
 */
export interface UserSettings {
    base_currency: string; // Moneda pivote seleccionada (e.g., 'USD', 'EUR')
    saving_percentage: number; // Porcentaje auto-deducible (e.g., 10 para 10%)
    budget_period: 'monthly' | 'weekly' | 'yearly'; // Ciclo de evaluación de presupuesto
    auto_save_enabled: boolean; // Flag maestro activa/desactiva ahorros en background
    savings_account_id?: string; // (Opcional) Referencia a la cuenta de destino exclusiva para ahorros
}
