import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto, SignInDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // Registro de usuario
    @Post('signup')
    async signUp(@Body() signUpDto: SignUpDto) {
        return this.authService.signUp(signUpDto);
    }

    // Inicio de sesión
    @Post('login')
    async signIn(@Body() signInDto: SignInDto) {
        return this.authService.signIn(signInDto);
    }

    // Cierre de sesión
    @Post('logout')
    async signOut(@Body('accessToken') accessToken: string) {
        return this.authService.signOut(accessToken);
    }

    // Recuperación de contraseña
    @Post('forgot-password')
    async forgotPassword(@Body('email') email: string) {
        return this.authService.requestPasswordReset(email);
    }

    // Restablecimiento de contraseña
    @Post('reset-password')
    async resetPassword(@Body('password') password: string, @Headers('authorization') authHeader: string) {
        if (!authHeader) throw new UnauthorizedException('No se proporcionó token.');
        const token = authHeader.replace('Bearer ', '');
        return this.authService.updatePassword(token, password);
    }
}
