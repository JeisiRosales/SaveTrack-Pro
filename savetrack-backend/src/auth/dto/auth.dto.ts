import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

// DTO para registro de nuevos usuarios
export class SignUpDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6, { message: 'La contraseña debe tener 6 carácteres mínimo.' })
    password: string;

    @IsString()
    @IsOptional()
    name?: string;
}

// DTO para inicio de sesión
export class SignInDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
