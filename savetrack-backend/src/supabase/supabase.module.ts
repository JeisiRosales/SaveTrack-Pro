// =============================================
// Módulo Global de Supabase
// Proporciona el cliente de Supabase a toda la aplicación
// =============================================
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseService } from './supabase.service';

@Global() // Hace que el módulo esté disponible globalmente sin necesidad de importarlo en cada módulo
@Module({
    imports: [ConfigModule], // Importa ConfigModule para acceder a variables de entorno
    providers: [SupabaseService], // Registra el servicio de Supabase
    exports: [SupabaseService], // Exporta el servicio para que otros módulos puedan usarlo
})
export class SupabaseModule { }