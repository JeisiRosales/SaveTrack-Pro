// =============================================
// Servicio de Supabase
// Crea y gestiona la conexión con Supabase
// =============================================
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    private supabase: SupabaseClient; // Cliente de Supabase (privado)
    private supabaseAdmin: SupabaseClient; // Cliente Admin de Supabase

    constructor(private configService: ConfigService) {
        // Inicializa el cliente de Supabase con las credenciales del .env
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('SUPABASE_URL y SUPABASE_ANON_KEY son requeridos en las variables de entorno');
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);

        const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');
        if (supabaseServiceKey) {
            this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            });
        }
    }

    // Método público para obtener el cliente de Supabase
    getClient(): SupabaseClient {
        return this.supabase;
    }

    // Método para obtener el cliente Admin (Service Role)
    getAdminClient(): SupabaseClient {
        if (!this.supabaseAdmin) {
            throw new Error('SUPABASE_SERVICE_KEY no está configurado. No se puede usar funciones administrativas.');
        }
        return this.supabaseAdmin;
    }
}