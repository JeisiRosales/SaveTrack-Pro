// =============================================
// Controlador de Autenticación
// Expone los endpoints de la API para autenticación
// Ubicación: src/auth/auth.controller.ts
// =============================================
import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
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

    @Post('forgot-password')
    async forgotPassword(@Body('email') email: string) {
        return this.authService.requestPasswordReset(email);
    }

    @Post('reset-password')
    async resetPassword(
        @Body('password') password: string,
        @Headers('authorization') authHeader: string
    ) {
        if (!authHeader) throw new UnauthorizedException('No se proporcionó token.');
        const token = authHeader.replace('Bearer ', '');
        return this.authService.updatePassword(token, password);
    }
}
