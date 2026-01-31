export interface UserSetting {
    id: string;
    user_id: string;
    base_currency: string;
    saving_percentage: number;
    budget_period: 'weekly' | 'monthly' | 'yearly';
}