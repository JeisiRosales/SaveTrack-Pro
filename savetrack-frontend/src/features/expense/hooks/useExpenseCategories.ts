import { useState, useEffect, useCallback } from 'react';
import { ExpenseCategory } from '../types';
import { getExpenseCategories, createExpenseCategory, deleteExpenseCategory, updateExpenseCategory } from '../api/expense-categories.api';

/**
 * Hook personalizado para manejar el estado y las operaciones de las Categorías de Gastos.
 * Útil para cargar la lista, añadir nuevas y eliminar existentes.
 */
export const useExpenseCategories = () => {
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [loading, setLoading] = useState(false);

    // Carga de manera asíncrona la lista de categorías del usuario actual.
    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getExpenseCategories();
            setCategories(res.data);
        } finally {
            setLoading(false);
        }
    }, []);

    // Efecto para obtener las categorías automáticamente al montar el hook
    useEffect(() => { fetchCategories(); }, [fetchCategories]);

    /**
     * Crea una nueva categoría enviándola a la base de datos y adjuntándola al estado.
     * @param name Nombre de la nueva categoría
     * @param is_fixed Tipo de categorización (Fijo o Variable)
     */
    const addCategory = async (name: string, is_fixed: boolean) => {
        const res = await createExpenseCategory({ name, is_fixed });
        setCategories(prev => [...prev, res.data]);
    };

    /**
     * Remueve una categoría de la base de datos y la quita de la lista mostrada.
     * @param id ID de la categoría a eliminar
     */
    const removeCategory = async (id: string) => {
        await deleteExpenseCategory(id);
        setCategories(prev => prev.filter(c => c.id !== id));
    };

    const updateCategory = async (id: string, name: string, is_fixed: boolean) => {
        const res = await updateExpenseCategory(id, { name, is_fixed });
        setCategories(prev => prev.map(c => c.id === id ? res.data : c));
    };

    return { categories, loading, addCategory, removeCategory, updateCategory };
};
