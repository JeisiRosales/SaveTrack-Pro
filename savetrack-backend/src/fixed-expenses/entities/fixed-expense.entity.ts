export interface FixedExpense {
    id: string;
    user_id: string;
    category_id: string;
    account_id?: string;
    name: string;
    amount: number;
    billing_day: number;
    is_active: boolean;
    created_at: Date;
    // Campos virtuales para la UI
    status?: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
    paidAmount?: number;
    isPaid?: boolean; // Mantener por retrocompatibilidad temporal
    categoryName?: string;
}
