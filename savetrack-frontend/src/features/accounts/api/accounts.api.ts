import api from '@/lib/api';
import { TransferForm, EditAccountForm } from '../types';

export const createAccount = (data: { name: string; balance: number }) =>
    api.post('/funding-accounts', data);

export const getAccounts = () => api.get('/funding-accounts');

export const getAccountTransactions = (id: string) => api.get(`/transactions/account/${id}`);

export const updateAccount = (id: string, data: EditAccountForm) =>
    api.patch(`/funding-accounts/${id}`, data);

export const deleteAccount = (id: string) =>
    api.delete(`/funding-accounts/${id}`);

export const transferFunds = (data: TransferForm) =>
    api.post('/transactions/transfer', data);
