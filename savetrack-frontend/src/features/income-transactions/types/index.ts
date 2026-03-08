/**
 * Interfaz fundamental para una transacción de ingreso (entrada monetaria)
 */
export interface IncomeTransaction {
    id: string; // ID primario de BD (UUID)
    account_id: string; // Cuenta bancaria destino (audiencia de fondos)
    category_id?: string; // Clasificación del ingreso dictaminado
    amount: number; // Suma acreditada
    description?: string; // Observaciones opcionales añadidas al ingreso
    created_at: string; // Sello de tiempo de la operación
}

/**
 * Payload requerido para enviar un nuevo Ingreso al API
 * Incluye un flag temporal (visual/UI) para procesar Auto-Save paralelamente.
 */
export interface CreateIncomeTransactionForm {
    account_id: string; // Cuenta recaudadora
    category_id?: string; // Etiqueta descriptiva para el ingreso
    amount: number; // Volumen del depósito
    description?: string; // Detalles extra
    perform_auto_save?: boolean; // ¡Punto clave! Determina si se cobra cuota automática.
}
