import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

// DTO para registro de nuevos usuarios
export class SignUpDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

    @IsString()
    @IsOptional()
    name?: string; // cambia fullName a name para que coincida con el payload
}

// DTO para inicio de sesión
export class SignInDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
