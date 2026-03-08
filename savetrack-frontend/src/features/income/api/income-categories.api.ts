import api from '@/lib/api';
import { CreateIncomeCategoryForm } from '../types';

/**
 * Obtiene todas las categorías de ingresos registradas por el usuario.
 * @returns Promesa con la respuesta de la API que incluye un arreglo de `IncomeCategory`
 */
export const getIncomeCategories = () => api.get('/income-categories');

/**
 * Crea una nueva categoría de ingresos.
 * @param data Objeto con la información de la categoría a crear
 * @returns Promesa con la respuesta de la API incluyendo la categoría creada
 */
export const createIncomeCategory = (data: CreateIncomeCategoryForm) => api.post('/income-categories', data);

/**
 * Elimina de manera permanente una categoría de ingreso.
 * @param id Identificador único de la categoría a eliminar
 * @returns Promesa resolviendo tras una eliminación exitosa
 */
export const deleteIncomeCategory = (id: string) => api.delete(`/income-categories/${id}`);

export const updateIncomeCategory = (id: string, data: Partial<CreateIncomeCategoryForm>) => api.patch(`/income-categories/${id}`, data);
