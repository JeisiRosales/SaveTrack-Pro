import { IsUUID, IsNumber, IsString, IsOptional, Min, IsNotEmpty } from 'class-validator';

export class CreateExpenseTransactionDto {
    @IsUUID()
    account_id: string;

    @IsUUID()
    @IsOptional()
    category_id?: string;

    @IsNumber()
    @Min(0.01)
    amount: number;

    @IsString()
    @IsOptional()
    description?: string;

    @IsUUID()
    @IsOptional()
    fixed_expense_id?: string;
}