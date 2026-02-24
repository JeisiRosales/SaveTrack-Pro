import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { SignUpDto, SignInDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    constructor(private supabase: SupabaseService, private configService: ConfigService) { }

    /**
     * Registra un nuevo usuario en Supabase Auth
     * @param dto - Datos de registro (email, password, nombre)
     */
    async signUp(dto: SignUpDto): Promise<any> {
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
            throw new BadRequestException(error.message);
        }

        if (data.user) {
            await this.createDefaultData(data.user.id);
        }

        return {
            user: data.user
        };
    }

    /**
     * Crea datos por defecto para el usuario
     * @param userId - ID del usuario
     */
    async createDefaultData(userId: string) {
        const defaultIncomeCategories = [
            'Salario',
            'Inversiones',
            'Regalos',
            'Otros'
        ];

        const defaultExpenseCategories = [
            { name: 'Renta', is_fixed: true }, // Es fijo
            { name: 'Servicios', is_fixed: true }, // Es fijo
            { name: 'Salud', is_fixed: false }, // No es fijo
            { name: 'Educación', is_fixed: false }, // No es fijo
            { name: 'Otros', is_fixed: false } // No es fijo
        ];

        const defaultAccounts = [
            { name: 'Cuenta Principal', balance: 0.00 },
            { name: 'Cuenta de Ahorros', balance: 0.00 }
        ];

        // Crear categorías de ingreso
        await this.supabase.getAdminClient()
            .from('income_categories')
            .insert(defaultIncomeCategories.map(name => ({ user_id: userId, name })));

        // Crear categorías de gasto
        await this.supabase.getAdminClient()
            .from('expense_categories')
            .insert(defaultExpenseCategories.map(cat => ({ user_id: userId, ...cat })));

        // Crear cuentas por defecto y obtener los IDs
        const { data: accounts } = await this.supabase.getAdminClient()
            .from('funding_accounts')
            .insert(defaultAccounts.map(account => ({ user_id: userId, ...account })))
            .select();

        // Buscar el ID de la cuenta de ahorros
        const savingsAccount = accounts?.find(acc => acc.name === 'Cuenta de Ahorros');

        // Crear configuraciones por defecto
        await this.supabase.getAdminClient()
            .from('user_settings')
            .insert({
                user_id: userId,
                base_currency: 'USD',
                saving_percentage: 20.00,
                budget_period: 'monthly',
                savings_account_id: savingsAccount?.id || null,
                auto_save_enabled: false
            });
    }

    /**
     * Obtiene el perfil del usuario actual
     * @param accessToken - Token de acceso del usuario
     */
    async getProfile(accessToken: string): Promise<any> {
        const { data, error } = await this.supabase.getClient().auth.getUser(accessToken);
        if (error) throw new UnauthorizedException(error.message);
        return data.user;
    }

    /**
     * Inicia sesión con email y contraseña
     * @param dto - Credenciales de acceso
     */
    async signIn(dto: SignInDto): Promise<any> {
        const { data, error } = await this.supabase.getClient().auth.signInWithPassword({
            email: dto.email,
            password: dto.password,
        });

        if (error) throw new UnauthorizedException(error.message);
        return {
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            data
        };
    }

    /**
     * Cierra la sesión del usuario actual
     * @param accessToken - Token de acceso del usuario
     */
    async signOut(accessToken: string): Promise<void> {
        const { error } = await this.supabase.getClient().auth.signOut();
        if (error) throw new UnauthorizedException(error.message);
    }

    /**
     * Envía un correo de recuperación de contraseña
     * @param email - Correo del usuario
     */
    async requestPasswordReset(email: string): Promise<{ message: string }> {
        const { error } = await this.supabase.getClient().auth.resetPasswordForEmail(email, {
            redirectTo: `${this.configService.get('FRONTEND_URL') || 'http://localhost:5173'}/reset-password`,
        });

        if (error) throw new BadRequestException(error.message);
        return { message: 'Correo de recuperación enviado exitosamente.' };
    }

    /**
     * Actualiza la contraseña del usuario (usado tras el reset)
     * @param accessToken - Token de acceso temporal
     * @param password - Nueva contraseña
     */
    async updatePassword(accessToken: string, password: string): Promise<{ message: string }> {
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
