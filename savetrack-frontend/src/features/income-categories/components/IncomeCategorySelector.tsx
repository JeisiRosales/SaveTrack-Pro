import React from 'react';
import { useIncomeCategories } from '../hooks/useIncomeCategories';

interface Props {
    selectedId: string; // ID de la categoría actualmente seleccionada
    onSelect: (id: string) => void; // Función callback al cambiar la selección
}

/**
 * Selector desplegable de Categorías de Ingreso
 * Carga automáticamente las categorías desde el backend utilizando el hook `useIncomeCategories`
 * y permite elegir una para propósitos como la creación de transacciones.
 */
export const IncomeCategorySelector: React.FC<Props> = ({ selectedId, onSelect }) => {
    const { categories, loading } = useIncomeCategories();

    return (
        <select
            value={selectedId} onChange={(e) => onSelect(e.target.value)}
            className="w-full bg-black/20 border border-white/10 text-white text-sm rounded-2xl p-4 outline-none focus:border-emerald-500 appearance-none"
        >
            <option value="" disabled>{loading ? "Cargando..." : "Selecciona una categoría"}</option>
            {/* Iterador de listado para mostrar las opciones en el <select> */}
            {categories.map(c => (
                <option key={c.id} value={c.id} className="bg-[#12141c] text-white">{c.name}</option>
            ))}
        </select>
    );
};
