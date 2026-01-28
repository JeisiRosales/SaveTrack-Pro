
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseService } from './supabase.service';

@Global()
@Module({
    imports: [ConfigModule], // Importa ConfigModule para acceder a variables de entorno
    providers: [SupabaseService], // Registra el servicio de Supabase
    exports: [SupabaseService], // Exporta el servicio para que otros módulos puedan usarlo
})
export class SupabaseModule { }