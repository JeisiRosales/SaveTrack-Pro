// Interfaz fundamental para una transacción de ingreso (entrada monetaria)

export interface IncomeTransaction {
    id: string;
    account_id: string;
    category_id?: string;
    amount: number;
    description?: string;
    created_at: string;
}

// Payload requerido para enviar un nuevo Ingreso al API
export interface CreateIncomeTransactionForm {
    account_id: string;
    category_id?: string;
    amount: number;
    description?: string;
    perform_auto_save?: boolean;
}

// Interfaz que representa una categoría de ingreso (eg. Salario, Ventas)
export interface IncomeCategory {
    id: string;
    name: string;
}

// Datos requeridos para crear una nueva categoría de ingreso
export interface CreateIncomeCategoryForm {
    name: string;
}
