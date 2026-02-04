export interface IncomeTransaction {
    id: string;
    account_id: string;
    category_id?: string;
    amount: number;
    description?: string;
    created_at: Date;
}