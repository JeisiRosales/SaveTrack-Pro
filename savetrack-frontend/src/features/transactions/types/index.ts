export interface Transaction {
    id: string;
    amount: number;
    type: 'deposit' | 'withdrawal';
    created_at: string;
    account_id: string;
    account_name: string;
    funding_accounts?: {
        name: string;
    };
    savings_goals?: {
        name: string;
    };
}

export interface TransactionTypeFilter {
    value: 'All' | 'deposit' | 'withdrawal';
    label: string;
    icon: React.ReactNode;
}

export interface AccountOption {
    value: string;
    label: string;
    icon: React.ReactNode;
}

export interface TransactionFormData {
    goalId?: string;
    accountId: string;
    type: 'deposit' | 'withdrawal';
    amount: number;
}
