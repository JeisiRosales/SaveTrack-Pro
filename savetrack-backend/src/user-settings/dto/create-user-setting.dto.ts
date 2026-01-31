import { IsString, IsNumber, IsIn, IsOptional, Min, Max } from 'class-validator';

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
}