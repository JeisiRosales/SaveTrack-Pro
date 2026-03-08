import api from '@/lib/api';
import { UserSettings } from '../types';

/**
 * Consulta la configuración única y centralizada del perfil de usuario en turno.
 * @returns Retorna la data empaquetada con la respuesta Axios.
 */
export const getUserSettings = () => api.get('/user-settings');

/**
 * Emite una mutación `PATCH` para sustituir gradualmente o completamente
 * un conjunto de parámetros personalizables.
 * @param data Conjunto parcial (Partial) de configuraciones mapeadas desde `UserSettings`
 * @returns Retorna el objeto unificado y modificado desde el servidor.
 */
export const updateUserSettings = (data: Partial<UserSettings>) => api.patch('/user-settings', data);

/**
 * Solicita la eliminación permanente de la cuenta del usuario.
 * @param userId - ID del usuario a eliminar
 */
export const deleteUserAccount = (userId: string) => api.delete(`/users/${userId}`);
