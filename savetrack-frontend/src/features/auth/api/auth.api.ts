import api from '@/lib/api';
import { LoginCredentials, RegisterCredentials, AuthResponse } from '../types';

// Petición para iniciar sesión
export const loginRequest = (credentials: LoginCredentials) =>
    api.post<AuthResponse>('/auth/login', credentials);

// Petición para registrarse
export const registerRequest = (credentials: RegisterCredentials) =>
    api.post('/auth/signup', credentials);

// Petición para restablecer contraseña
export const resetPasswordRequest = (password: string) =>
    api.post('/auth/reset-password', { password });

// Petición para olvidar contraseña
export const forgotPasswordRequest = (email: string) =>
    api.post('/auth/forgot-password', { email });