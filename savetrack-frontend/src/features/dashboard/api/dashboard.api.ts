import api from '@/lib/api';

export const getAccounts = () => api.get('/funding-accounts');
export const getGoals = () => api.get('/savings-goals');
export const getTransactions = () => api.get('/transactions');

export const getDashboardSummary = () => {
    return Promise.allSettled([
        getAccounts(),
        getGoals(),
        getTransactions()
    ]);
};
