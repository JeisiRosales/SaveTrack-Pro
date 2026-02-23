import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateAccountDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsOptional()
    balance?: number;
}