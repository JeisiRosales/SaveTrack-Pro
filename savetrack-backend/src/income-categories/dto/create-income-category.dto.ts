import { IsString, IsNotEmpty } from 'class-validator';

export class CreateIncomeCategoryDto {
    @IsString()
    @IsNotEmpty()
    name: string;
}