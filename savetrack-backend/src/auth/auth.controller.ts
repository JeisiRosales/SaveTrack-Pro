// =============================================
// Controlador de Autenticación
// Expone los endpoints de la API para autenticación
// Ubicación: src/auth/auth.controller.ts
// =============================================
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto, SignInDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('signup')
    async signUp(@Body() signUpDto: SignUpDto) {
        return this.authService.signUp(signUpDto);
    }

    @Post('login')
    async signIn(@Body() signInDto: SignInDto) {
        return this.authService.signIn(signInDto);
    }

    @Post('logout')
    async signOut(@Body('accessToken') accessToken: string) {
        // Nota: En un caso real, el token vendría del header Authorization
        return this.authService.signOut(accessToken);
    }
}
