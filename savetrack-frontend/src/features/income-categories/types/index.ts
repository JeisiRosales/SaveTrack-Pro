/**
 * Interfaz que representa una categoría de ingreso (eg. Salario, Ventas)
 */
export interface IncomeCategory {
    id: string; // Identificador único de la categoría (UUID)
    name: string; // Nombre descriptivo de la categoría
}

/**
 * Datos requeridos para crear una nueva categoría de ingreso
 */
export interface CreateIncomeCategoryForm {
    name: string; // Nombre de la nueva categoría
}
