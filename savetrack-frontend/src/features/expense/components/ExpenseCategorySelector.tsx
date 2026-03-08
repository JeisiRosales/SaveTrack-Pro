import React, { useState } from 'react';
import { ChevronDown, Plus, Repeat, Zap, Loader2 } from 'lucide-react';
import { useExpenseCategories } from '@/features/expense/hooks/useExpenseCategories';

interface Props {
    selectedId: string;
    onSelect: (id: string) => void;
}

/**
 * Selector de categorías de gasto con indicador visual fijo/variable.
 * Permite crear nuevas categorías inline sin salir del modal.
 */
export const ExpenseCategorySelector: React.FC<Props> = ({ selectedId, onSelect }) => {
    const { categories, loading, addCategory } = useExpenseCategories();
    const [isOpen, setIsOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newIsFixed, setNewIsFixed] = useState(false);
    const [saving, setSaving] = useState(false);

    const selected = categories.find(c => c.id === selectedId);

    const handleCreate = async () => {
        if (!newName.trim()) return;
        setSaving(true);
        try {
            await addCategory(newName.trim(), newIsFixed);
            setNewName('');
            setIsCreating(false);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="relative">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(p => !p)}
                className="text-[var(--foreground)] text-sm w-full flex items-center justify-between px-4 py-4 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl focus:ring-2 focus:ring-rose-600 transition-all outline-none"
            >
                {selected ? (
                    <span className="flex items-center gap-2">
                        {selected.is_fixed
                            ? <Repeat className="w-3.5 h-3.5 text-violet-400" />
                            : <Zap className="w-3.5 h-3.5 text-orange-400" />
                        }
                        <span>{selected.name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            selected.is_fixed
                                ? 'bg-violet-500/10 text-violet-400'
                                : 'bg-orange-500/10 text-orange-400'
                        }`}>
                            {selected.is_fixed ? 'Fijo' : 'Variable'}
                        </span>
                    </span>
                ) : (
                    <span className="text-[var(--muted)]">Selecciona categoría</span>
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
                            {(['fixed', 'variable'] as const).map(group => {
                                const items = categories.filter(c =>
                                    group === 'fixed' ? c.is_fixed : !c.is_fixed
                                );
                                if (items.length === 0) return null;
                                return (
                                    <div key={group}>
                                        <p className={`px-3 pt-3 pb-1 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${
                                            group === 'fixed' ? 'text-violet-400' : 'text-orange-400'
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
                                                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--background)] flex items-center gap-2 ${
                                                    selectedId === cat.id ? 'text-[var(--foreground)] font-bold' : 'text-[var(--muted)]'
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

                            {/* Crear nueva categoría inline */}
                            <div className="border-t border-[var(--card-border)] p-3">
                                {!isCreating ? (
                                    <button
                                        type="button"
                                        onClick={() => setIsCreating(true)}
                                        className="w-full flex items-center gap-2 text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors py-1"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Nueva categoría
                                    </button>
                                ) : (
                                    <div className="space-y-2">
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Nombre de la categoría"
                                            value={newName}
                                            onChange={e => setNewName(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleCreate()}
                                            className="w-full text-sm bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--foreground)] rounded-lg px-3 py-2 outline-none"
                                        />
                                        {/* Toggle fijo/variable */}
                                        <div className="flex bg-[var(--background)] border border-[var(--card-border)] rounded-lg p-0.5 gap-0.5">
                                            <button
                                                type="button"
                                                onClick={() => setNewIsFixed(false)}
                                                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                                                    !newIsFixed
                                                        ? 'bg-orange-500 text-white'
                                                        : 'text-[var(--muted)]'
                                                }`}
                                            >
                                                <Zap className="w-3 h-3" /> Variable
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setNewIsFixed(true)}
                                                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                                                    newIsFixed
                                                        ? 'bg-violet-500 text-white'
                                                        : 'text-[var(--muted)]'
                                                }`}
                                            >
                                                <Repeat className="w-3 h-3" /> Fijo
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setIsCreating(false)}
                                                className="flex-1 text-xs font-bold text-[var(--muted)] py-1.5 rounded-lg hover:bg-[var(--background)] transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCreate}
                                                disabled={saving || !newName.trim()}
                                                className="flex-1 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {saving ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Crear'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
