import api from '@/lib/api';
import { LoginCredentials, RegisterCredentials, AuthResponse } from '../types';

export const loginRequest = (credentials: LoginCredentials) =>
    api.post<AuthResponse>('/auth/login', credentials);

export const registerRequest = (credentials: RegisterCredentials) =>
    api.post('/auth/signup', credentials);

export const resetPasswordRequest = (password: string) =>
    api.post('/auth/reset-password', { password });

export const forgotPasswordRequest = (email: string) =>
    api.post('/auth/forgot-password', { email });