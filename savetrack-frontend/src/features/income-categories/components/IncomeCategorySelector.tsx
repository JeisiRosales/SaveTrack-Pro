import React from 'react';
import { useIncomeCategories } from '../hooks/useIncomeCategories';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { Tag } from 'lucide-react';

interface Props {
    selectedId: string;
    onSelect: (id: string) => void;
}

export const IncomeCategorySelector: React.FC<Props> = ({ selectedId, onSelect }) => {
    const { categories, loading } = useIncomeCategories();

    const categoryOptions = categories.map(cat => ({
        value: cat.id,
        label: cat.name,
        icon: <Tag className="w-4 h-4" />
    }));

    return (
        <CustomSelect
            options={categoryOptions}
            value={selectedId}
            onChange={onSelect}
            placeholder={loading ? "Cargando..." : "Selecciona una categoría"}
            disabled={loading}
        />
    );
};
