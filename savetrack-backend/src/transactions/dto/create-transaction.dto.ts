import { IsString, IsNotEmpty, IsNumber, IsIn } from 'class-validator';

export class CreateTransactionDto {
    @IsString()
    @IsNotEmpty()
    goalId: string; // ID de la meta de ahorro

    @IsString()
    @IsNotEmpty()
    accountId: string; // ID de la cuenta fuente

    @IsNumber()
    @IsNotEmpty()
    amount: number; // Monto de la transacción

    @IsIn(['deposit', 'withdrawal'])
    type: 'deposit' | 'withdrawal'; // Tipo: depósito (agregar) o retiro (quitar)
}