import api from '@/lib/api';
import { TransactionFormData } from '../types';

// Obtiene todas las transacciones del usuario
export const getTransactions = () => api.get('/transactions');

// Obtiene transacciones de una cuenta específica
export const getAccountTransactions = (accountId: string) =>
    api.get(`/transactions/account/${accountId}`);

// Crea una nueva transacción
export const createTransaction = (data: TransactionFormData) =>
    api.post('/transactions', data);
