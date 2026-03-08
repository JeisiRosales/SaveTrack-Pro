/**
 * Interfaz que representa una transacción individual de gasto
 */
export interface ExpenseTransaction {
    id: string; // Identificador en la BD (UUID)
    account_id: string; // Referencia a la cuenta de origen de los fondos
    category_id?: string; // (Opcional) Referencia a la categoría de gasto
    amount: number; // Monto de la transacción (Ej: 15.50)
    description?: string; // (Opcional) Concepto, detalle o notas
    created_at: string; // Fecha de creación ISO proporcionada por Supabase
    expense_categories?: { name: string }; // Join relation
}

/**
 * Datos requeridos para registrar una transacción de gasto
 */
export interface CreateExpenseTransactionForm {
    account_id: string; // Cuenta de la cual descontar
    category_id?: string; // Clasificación del gasto
    amount: number; // Importe del desembolso
    description?: string; // Datos adicionales o notas
}
