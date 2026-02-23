import { IsString, IsNumber, IsIn, IsOptional, Min, Max, IsBoolean } from 'class-validator';

export class CreateUserSettingDto {
    @IsString()
    @IsOptional()
    base_currency?: string = 'USD';

    @IsNumber()
    @Min(0)
    @Max(100)
    @IsOptional()
    saving_percentage?: number = 10.00;

    @IsString()
    @IsIn(['weekly', 'monthly', 'yearly'])
    @IsOptional()
    budget_period?: 'weekly' | 'monthly' | 'yearly' = 'monthly';

    @IsNumber()
    @IsOptional()
    @Min(0)
    monthly_income_target?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    monthly_expense_budget?: number;

    @IsBoolean()
    @IsOptional()
    auto_save_enabled?: boolean = false;

    @IsString()
    @IsOptional()
    savings_account_id?: string;
}