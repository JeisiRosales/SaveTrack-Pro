import api from '@/lib/api';
import { TransferForm, EditAccountForm } from '../types';

// Petición para crear una cuenta
export const createAccount = (data: { name: string; balance: number }) =>
    api.post('/funding-accounts', data);

// Petición para obtener las cuentas
export const getAccounts = () => api.get('/funding-accounts');

// Petición para obtener las transacciones de una cuenta
export const getAccountTransactions = (id: string) => api.get(`/transactions/account/${id}`);

// Petición para actualizar una cuenta
export const updateAccount = (id: string, data: EditAccountForm) =>
    api.patch(`/funding-accounts/${id}`, data);

// Petición para eliminar una cuenta
export const deleteAccount = (id: string) =>
    api.delete(`/funding-accounts/${id}`);

// Petición para transferir fondos
export const transferFunds = (data: TransferForm) =>
    api.post('/transactions/transfer', data);
