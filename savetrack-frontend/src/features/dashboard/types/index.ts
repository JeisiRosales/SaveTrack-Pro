export interface Account {
    id: string;
    name: string;
    balance: number;
}

export interface Goal {
    id: string;
    name: string;
    current_amount: number;
    target_amount: number;
    end_date: string;
}

export interface Transaction {
    id: string;
    type: 'deposit' | 'withdrawal';
    amount: number;
    created_at: string;
    funding_accounts?: { name: string };
    savings_goals?: { name: string };
}