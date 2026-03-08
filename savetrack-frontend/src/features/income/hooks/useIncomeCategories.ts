import { useState, useEffect, useCallback } from 'react';
import { IncomeCategory } from '../../income-categories/types';
import { getIncomeCategories, createIncomeCategory, deleteIncomeCategory, updateIncomeCategory } from '../api/income-categories.api';

/**
 * Hook personalizado para manejar el estado y las operaciones de las Categorías de Ingresos.
 * Útil para cargar la lista, añadir nuevas y eliminar existentes.
 */
export const useIncomeCategories = () => {
    const [categories, setCategories] = useState<IncomeCategory[]>([]);
    const [loading, setLoading] = useState(false);

    /**
     * Carga de manera asíncrona la lista de categorías del usuario actual.
     */
    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getIncomeCategories();
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
     */
    const addCategory = async (name: string) => {
        const res = await createIncomeCategory({ name });
        setCategories(prev => [...prev, res.data]);
    };

    /**
     * Remueve una categoría de la base de datos y la quita de la lista mostrada.
     * @param id ID de la categoría a eliminar
     */
    const removeCategory = async (id: string) => {
        await deleteIncomeCategory(id);
        setCategories(prev => prev.filter(c => c.id !== id));
    };

    const updateCategory = async (id: string, name: string) => {
        const res = await updateIncomeCategory(id, { name });
        setCategories(prev => prev.map(c => c.id === id ? res.data : c));
    };

    return { categories, loading, addCategory, removeCategory, updateCategory };
};
