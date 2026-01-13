import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateAccountDto {
    @IsString()
    @IsNotEmpty()
    name: string; // Nombre de la cuenta (ej: "Cuenta de Ahorros", "Cuenta Corriente")

    @IsNumber()
    @IsOptional()
    balance?: number; // Balance inicial (opcional, por defecto 0)
}