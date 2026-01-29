import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { User } from './entities/user.entity';


@Injectable()
export class UsersService {
  constructor(private readonly supabase: SupabaseService) { }


  async updateProfile(userId: string, data: any): Promise<{ message: string }> {
    // Actualizar metadata de auth
    const { error: authError } = await this.supabase.getClient().auth.updateUser({
      data: { full_name: data.name }
    });
    if (authError) throw new BadRequestException(authError.message);

    // Actualizar tabla 'profiles'
    const { error: profileError } = await this.supabase.getClient()
      .from('profiles')
      .update({ full_name: data.name, updated_at: new Date() })
      .eq('id', userId);

    if (profileError) throw new BadRequestException(profileError.message);

    return { message: 'Perfil actualizado correctamente en base de datos' };
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    const { error } = await this.supabase.getAdminClient().auth.admin.deleteUser(userId);
    if (error) throw new BadRequestException(error.message);
    return { message: 'Usuario eliminado correctamente' };
  }

}
