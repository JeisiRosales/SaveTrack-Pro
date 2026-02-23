export interface UserSetting {
    id: string;
    user_id: string;
    base_currency: string;
    saving_percentage: number;
    budget_period: 'weekly' | 'monthly' | 'yearly';
    monthly_income_target: number;
    monthly_expense_budget: number;
    auto_save_enabled: boolean;
    savings_account_id?: string;
}