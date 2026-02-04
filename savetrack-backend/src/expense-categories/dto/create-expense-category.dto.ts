import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateExpenseCategoryDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsBoolean()
    @IsOptional()
    is_fixed?: boolean = false;
}