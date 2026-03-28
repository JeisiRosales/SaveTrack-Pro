import { IsUUID, IsNumber, IsString, IsNotEmpty, Min, Max, IsBoolean, IsOptional } from 'class-validator';

export class CreateFixedExpenseDto {
    @IsUUID()
    @IsNotEmpty()
    category_id: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @Min(0.01)
    amount: number;

    @IsNumber()
    @Min(1)
    @Max(31)
    billing_day: number;

    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}
