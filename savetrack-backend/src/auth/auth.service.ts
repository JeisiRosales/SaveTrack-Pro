
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { SignUpDto, SignInDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    constructor(
        private supabase: SupabaseService,
        private configService: ConfigService
    ) { }

    // Registra un nuevo usuario en Supabase Auth
    async signUp(dto: SignUpDto) {
        const { data, error } = await this.supabase.getClient().auth.signUp({
            email: dto.email,
            password: dto.password,
            options: {
                data: {
                    full_name: dto.name, // Metadatos que el trigger usará
                },
                emailRedirectTo: `${this.configService.get('FRONTEND_URL') || 'http://localhost:5173'}/login?confirmed=true`,
            },
        });

        if (error) {
            console.error('Supabase SignUp Error:', error);
            throw new BadRequestException(error.message);
        }
        return data;
    }

    // Inicia sesión con email y contraseña
    async signIn(dto: SignInDto) {
        const { data, error } = await this.supabase.getClient().auth.signInWithPassword({
            email: dto.email,
            password: dto.password,
        });

        if (error) throw new UnauthorizedException(error.message);
        return data; // Contiene: user, session (con access_token y refresh_token)
    }

    // Cierra la sesión del usuario actual
    async signOut(accessToken: string) {
        const { error } = await this.supabase.getClient().auth.signOut();
        if (error) throw new UnauthorizedException(error.message);
    }

    // Envía un correo de recuperación de contraseña
    async requestPasswordReset(email: string) {
        const { error } = await this.supabase.getClient().auth.resetPasswordForEmail(email, {
            redirectTo: `${this.configService.get('FRONTEND_URL') || 'http://localhost:5173'}/reset-password`,
        });

        if (error) throw new BadRequestException(error.message);
        return { message: 'Correo de recuperación enviado exitosamente.' };
    }

    // Actualiza la contraseña del usuario (usado tras el reset)
    async updatePassword(accessToken: string, password: string) {
        // Obtenemos el cliente con el token del usuario para asegurar que está autorizado
        const { data: { user }, error: userError } = await this.supabase.getClient().auth.getUser(accessToken);

        if (userError || !user) {
            throw new UnauthorizedException('Token inválido o expirado.');
        }

        // Actualizamos la contraseña del usuario
        const { error } = await this.supabase.getAdminClient().auth.admin.updateUserById(user.id, {
            password: password
        });

        if (error) throw new BadRequestException(error.message);
        return { message: 'Contraseña actualizada correctamente.' };
    }
}
