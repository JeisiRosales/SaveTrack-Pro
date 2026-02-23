import { IsUUID, IsNumber, IsString, IsOptional, Min, IsNotEmpty, IsBoolean } from 'class-validator';

export class CreateIncomeTransactionDto {
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

    @IsBoolean()
    @IsOptional()
    perform_auto_save?: boolean;
}