// =============================================
// DTOs de Autenticación
// Definen la estructura de datos para registro e inicio de sesión
// Ubicación: src/auth/dto/auth.dto.ts
// =============================================

// DTO para registro de nuevos usuarios
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
    name?: string; // Changed from fullName to match common payloads and consistency
}


// DTO para inicio de sesión
// DTO para inicio de sesión
export class SignInDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
