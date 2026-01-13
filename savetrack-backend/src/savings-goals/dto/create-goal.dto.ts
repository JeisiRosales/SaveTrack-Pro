import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString, IsUrl } from 'class-validator';

export class CreateGoalDto {
    @IsString()
    @IsNotEmpty()
    name: string; // Nombre de la meta (ej: "Vacaciones en Europa")

    @IsNumber()
    @IsNotEmpty()
    targetAmount: number; // Monto objetivo a alcanzar

    @IsNumber()
    @IsOptional()
    initialAmount?: number; // Monto inicial (opcional)

    @IsDateString()
    @IsNotEmpty()
    startDate: string; // Fecha de inicio (formato ISO: YYYY-MM-DD)

    @IsDateString()
    @IsNotEmpty()
    endDate: string; // Fecha límite (formato ISO: YYYY-MM-DD)

    @IsUrl()
    @IsOptional()
    imageUrl?: string; // URL de la imagen (opcional)
}