export interface Account {
    id: string;
    name: string;
    balance: number;
    created_at: string;
}

export interface TransferForm {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
}

export interface EditAccountForm {
    name: string;
    balance: number;
}

export interface Transaction {
    id: string;
    amount: number;
    type: 'deposit' | 'withdrawal';
    created_at: string;
    funding_accounts?: {
        name: string;
    };
    savings_goals?: {
        name: string;
    };
}
