import { IsString, IsNotEmpty, IsNumber, IsIn } from 'class-validator';

export class CreateTransactionDto {
    @IsString()
    @IsNotEmpty()
    goalId: string;

    @IsString()
    @IsNotEmpty()
    accountId: string;

    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsIn(['deposit', 'withdrawal'])
    type: 'deposit' | 'withdrawal';
}