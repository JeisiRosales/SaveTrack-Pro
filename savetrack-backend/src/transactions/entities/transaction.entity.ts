export type TransactionType = 'deposit' | 'withdrawal' | 'transfer';

export interface Transaction {
    id: string;
    goal_id?: string;
    account_id: string;
    amount: number;
    type: TransactionType;
    description?: string;
    created_at: Date;
}
