export interface Goal {
    id: string;
    name: string;
    target_amount: number;
    current_amount: number;
    start_date: string;
    end_date: string;
    created_at: string;
}

export interface GoalFormData {
    name: string;
    targetAmount: number;
    initialAmount: number;
    startDate?: string;
    endDate: string;
}

export interface WeeklyStatus {
    balanceToStayOnTrack: number;
    isBehind: boolean;
    balanceToPay: number;
    weeksElapsed: number;
    totalWeeksDuration: number;
    weeklyInstallment: number;
    weeksDuration: number;
    expectedAccumulated: number;
}
