export interface SavingsGoal {
    id: string;
    user_id: string;
    name: string;
    target_amount: number;
    initial_amount: number;
    current_amount: number;
    start_date: string;
    end_date: string;
    image_url?: string;
    created_at: Date;
    updated_at: Date;
}
