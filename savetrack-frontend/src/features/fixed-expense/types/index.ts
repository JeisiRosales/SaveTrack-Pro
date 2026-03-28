export interface FixedExpense {
    id: string;
    user_id: string;
    category_id: string;
    account_id: string;
    name: string;
    amount: number;
    billing_day: number;
    is_active: boolean;
    created_at: string;
    categoryName?: string;
    categoryIcon?: string;
    isPaid?: boolean;
    paidAmount?: number;
    status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
    remainingAmount?: number;
}

export interface FixedExpenseSummary {
    totalMonthly: number;
    pendingThisMonth: number;
    paidThisMonth: number;
    count: number;
}
