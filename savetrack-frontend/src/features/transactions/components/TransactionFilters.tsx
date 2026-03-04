import React from 'react';
import { Search, Filter, Wallet, Tag } from 'lucide-react';
import CustomDropdown from '@/components/ui/CustomDropdown';
import { Account } from '@/features/accounts/types';

// Filtros para transacciones
interface TransactionFiltersProps {
    searchTerm: string;
    onSearchChange: (val: string) => void;
    typeFilter: 'All' | 'deposit' | 'withdrawal';
    onTypeFilterChange: (val: 'All' | 'deposit' | 'withdrawal') => void;
    accountFilter: string;
    onAccountFilterChange: (val: string) => void;
    accounts: Account[];
}

// Componente de filtros para transacciones
export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
    searchTerm,
    onSearchChange,
    typeFilter,
    onTypeFilterChange,
    accountFilter,
    onAccountFilterChange,
    accounts
}) => {
    const typeOptions = [
        { value: 'All', label: 'Todos los Tipos', icon: <Tag className="w-3 h-3" /> },
        { value: 'deposit', label: 'Depósitos', icon: <Plus className="w-3 h-3 text-emerald-500" /> },
        { value: 'withdrawal', label: 'Retiros', icon: <Minus className="w-3 h-3 text-rose-500" /> },
    ];

    const accountOptions = [
        { value: 'All', label: 'Todas las Cuentas', icon: <Wallet className="w-3 h-3" /> },
        ...accounts.map(acc => ({
            value: acc.id,
            label: acc.name,
            icon: <Wallet className="w-3 h-3 text-indigo-500" />
        }))
    ];

    return (
        <div className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--card-border)] mb-6 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                    <input
                        type="text"
                        placeholder="Buscar por meta..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                    <CustomDropdown
                        options={typeOptions}
                        value={typeFilter}
                        onChange={(val) => onTypeFilterChange(val as any)}
                        icon={<Filter className="w-4 h-4" />}
                        className="w-full sm:w-[180px]"
                    />

                    <CustomDropdown
                        options={accountOptions}
                        value={accountFilter}
                        onChange={onAccountFilterChange}
                        icon={<Wallet className="w-4 h-4" />}
                        className="w-full sm:w-[200px]"
                    />
                </div>
            </div>
        </div>
    );
};

// Iconos para filtros
const Plus = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

// Iconos para filtros
const Minus = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
);
