/**
 * Interfaz que representa una categoría de gasto (eg. Transporte, Comida)
 */
export interface ExpenseCategory {
    id: string; // Identificador único de la categoría (UUID)
    name: string; // Nombre descriptivo de la categoría
    is_fixed: boolean; // Indica si es un gasto fijo (ej. Alquiler)
}

/**
 * Datos requeridos para crear una nueva categoría de gasto
 */
export interface CreateExpenseCategoryForm {
    name: string; // Nombre de la nueva categoría
    is_fixed?: boolean; // (Opcional) Define si el gasto será fijo
}
