import api from '@/lib/api';
import { TransactionFormData } from '../types';

export const getTransactions = () => api.get('/transactions');

export const getAccountTransactions = (accountId: string) =>
    api.get(`/transactions/account/${accountId}`);

export const createTransaction = (data: TransactionFormData) =>
    api.post('/transactions', data);
