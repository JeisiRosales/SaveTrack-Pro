// =============================================
// Servicio de Autenticación
// Maneja el registro, inicio de sesión y cierre de sesión
// =============================================
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { SignUpDto, SignInDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    constructor(private supabase: SupabaseService) { }

    /**
     * Registra un nuevo usuario en Supabase Auth
     * El trigger handle_new_user() creará automáticamente el perfil
     */
    async signUp(dto: SignUpDto) {
        // Intenta registrar al usuario en Supabase Auth
        const { data, error } = await this.supabase.getClient().auth.signUp({
            email: dto.email,
            password: dto.password,
            options: {
                data: {
                    full_name: dto.name, // Metadatos que el trigger usará
                },
            },
        });



        if (error) {
            console.error('Supabase SignUp Error:', error);
            throw new BadRequestException(error.message);
        }



        // NOTA: Ya no es necesario crear el perfil manualmente
        // El trigger on_auth_user_created lo hace automáticamente

        return data;
    }

    /**
     * Inicia sesión con email y contraseña
     * Retorna el usuario y el token de acceso
     */
    async signIn(dto: SignInDto) {
        const { data, error } = await this.supabase.getClient().auth.signInWithPassword({
            email: dto.email,
            password: dto.password,
        });

        if (error) throw new UnauthorizedException(error.message);
        return data; // Contiene: user, session (con access_token y refresh_token)
    }

    /**
     * Cierra la sesión del usuario actual
     */
    async signOut(accessToken: string) {
        const { error } = await this.supabase.getClient().auth.signOut();
        if (error) throw new UnauthorizedException(error.message);
    }
}
