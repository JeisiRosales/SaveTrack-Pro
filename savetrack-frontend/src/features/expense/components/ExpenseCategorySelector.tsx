import React, { useState } from 'react';
import { ChevronDown, Repeat, Zap, Loader2 } from 'lucide-react';
import { useExpenseCategories } from '@/features/expense/hooks/useExpenseCategories';

interface Props {
    selectedId: string;
    onSelect: (id: string) => void;
    filterType?: 'all' | 'fixed' | 'variable';
}

/**
 * Selector de categorías de gasto con indicador visual fijo/variable.
 * Permite crear nuevas categorías inline sin salir del modal.
 */
export const ExpenseCategorySelector: React.FC<Props> = ({ selectedId, onSelect, filterType = 'all' }) => {
    const { categories, loading } = useExpenseCategories();
    const [isOpen, setIsOpen] = useState(false);

    const filteredCategories = categories.filter(c => {
        if (filterType === 'fixed') return c.is_fixed;
        if (filterType === 'variable') return !c.is_fixed;
        return true;
    });

    const selected = filteredCategories.find(c => c.id === selectedId);

    return (
        <div className="relative">
            {/* Trigger */}
            <button
                type="button"
                disabled={loading || filteredCategories.length === 0}
                onClick={() => setIsOpen(p => !p)}
                className="text-[var(--foreground)] text-sm w-full flex items-center justify-between px-4 py-4 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl focus:ring-2 focus:ring-rose-600 transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {selected ? (
                    <span className="flex items-center gap-2">
                        {selected.is_fixed
                            ? <Repeat className="w-3.5 h-3.5 text-violet-400" />
                            : <Zap className="w-3.5 h-3.5 text-orange-400" />
                        }
                        <span>{selected.name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${selected.is_fixed
                            ? 'bg-violet-500/10 text-violet-400'
                            : 'bg-orange-500/10 text-orange-400'
                            }`}>
                            {selected.is_fixed ? 'Fijo' : 'Variable'}
                        </span>
                    </span>
                ) : (
                    <span className="text-[var(--muted)]">
                        {loading
                            ? "Cargando..."
                            : (filteredCategories.length === 0
                                ? (filterType === 'fixed' ? "No hay categorías fijas creadas" : "No hay categorías creadas")
                                : "Selecciona categoría")
                        }
                    </span>
                )}
                <ChevronDown className={`w-4 h-4 text-[var(--muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 mt-2 w-full bg-[var(--card)] border border-[var(--card-border)] rounded-2xl shadow-xl overflow-hidden">
                    {loading ? (
                        <div className="p-4 flex justify-center">
                            <Loader2 className="w-4 h-4 animate-spin text-[var(--muted)]" />
                        </div>
                    ) : (
                        <>
                            {/* Grupos: Fijos y Variables */}
                            {(filterType === 'all' ? ['fixed', 'variable'] as const : [filterType] as const).map(group => {
                                const items = filteredCategories.filter(c =>
                                    group === 'fixed' ? c.is_fixed : !c.is_fixed
                                );
                                if (items.length === 0) return null;
                                return (
                                    <div key={group}>
                                        <p className={`px-3 pt-3 pb-1 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${group === 'fixed' ? 'text-violet-400' : 'text-orange-400'
                                            }`}>
                                            {group === 'fixed'
                                                ? <><Repeat className="w-3 h-3" /> Fijos</>
                                                : <><Zap className="w-3 h-3" /> Variables</>
                                            }
                                        </p>
                                        {items.map(cat => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => { onSelect(cat.id); setIsOpen(false); }}
                                                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--background)] flex items-center gap-2 ${selectedId === cat.id ? 'text-[var(--foreground)] font-bold' : 'text-[var(--muted)]'
                                                    }`}
                                            >
                                                {cat.is_fixed
                                                    ? <Repeat className="w-3 h-3 text-violet-400 flex-shrink-0" />
                                                    : <Zap className="w-3 h-3 text-orange-400 flex-shrink-0" />
                                                }
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
