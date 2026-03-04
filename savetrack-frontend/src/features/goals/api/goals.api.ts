import api from '@/lib/api';
import { GoalFormData } from '../types';

// obtener todas las metas
export const getGoals = () => api.get('/savings-goals');

// obtener una meta por id
export const getGoal = (id: string) => api.get(`/savings-goals/${id}`);

// crear una meta
export const createGoal = (data: GoalFormData) =>
    api.post('/savings-goals', data);

// actualizar una meta
export const updateGoal = (id: string, data: Partial<GoalFormData>) =>
    api.patch(`/savings-goals/${id}`, data);

// eliminar una meta
export const deleteGoal = (id: string) =>
    api.delete(`/savings-goals/${id}`);

// obtener transacciones de una meta
export const getGoalTransactions = (goalId: string) =>
    api.get(`/transactions/goal/${goalId}`);
