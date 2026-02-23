import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString, IsUrl } from 'class-validator';

export class CreateGoalDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsNotEmpty()
    targetAmount: number;

    @IsNumber()
    @IsOptional()
    initialAmount?: number;

    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @IsDateString()
    @IsNotEmpty()
    endDate: string;

    @IsUrl()
    @IsOptional()
    imageUrl?: string;
}