// Interfaz que representa una categoría de gasto (eg. Transporte, Comida)
export interface ExpenseCategory {
    id: string;
    name: string;
    is_fixed: boolean;
}

// Datos requeridos para crear una nueva categoría de gasto
export interface CreateExpenseCategoryForm {
    name: string;
    is_fixed?: boolean;
}

// Interfaz que representa una transacción individual de gasto
export interface ExpenseTransaction {
    id: string;
    account_id: string;
    category_id?: string;
    amount: number;
    description?: string;
    created_at: string;
    expense_categories?: { name: string };
}

// Datos requeridos para registrar una transacción de gasto
export interface CreateExpenseTransactionForm {
    account_id: string;
    category_id?: string;
    amount: number;
    description?: string;
}
