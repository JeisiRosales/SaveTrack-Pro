import React, { useState } from 'react';
import { Trash2, Plus, Loader2, Edit2, Check, X } from 'lucide-react';

export interface CategoryListProps {
    title: string;
    icon: React.ReactNode;
    categories: any[];
    loading: boolean;
    onAdd: (name: string, isFixed: boolean) => Promise<void>;
    onRemove: (id: string) => Promise<void>;
    onUpdate: (id: string, name: string, isFixed: boolean) => Promise<void>;
    showIsFixed?: boolean;
}

export const CategoryList: React.FC<CategoryListProps> = ({
    title, icon, categories, loading, onAdd, onRemove, onUpdate, showIsFixed = false
}) => {
    const [name, setName] = useState('');
    const [isFixed, setIsFixed] = useState(false);
    const [adding, setAdding] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editIsFixed, setEditIsFixed] = useState(false);
    const [updating, setUpdating] = useState(false);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setAdding(true);
        try {
            await onAdd(name, isFixed);
            setName('');
            setIsFixed(false);
        } finally {
            setAdding(false);
        }
    };

    const startEdit = (cat: any) => {
        setEditingId(cat.id);
        setEditName(cat.name);
        setEditIsFixed(cat.is_fixed || false);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName('');
        setEditIsFixed(false);
    };

    const saveEdit = async (id: string) => {
        setUpdating(true);
        try {
            await onUpdate(id, editName, editIsFixed);
            setEditingId(null);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-6 w-full max-w-xl shadow-sm">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
                {icon} {title}
            </h2>

            <div className="space-y-2 max-h-[400px] overflow-y-auto mb-6 pr-2 scrollbar-thin">
                {loading ? (
                    <div className="flex items-center gap-2 text-[var(--muted)] py-4 justify-center">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-xs font-medium">Cargando...</span>
                    </div>
                ) : categories.length === 0 ? (
                    <p className="text-[var(--muted)] text-sm py-4 text-center">No hay categorías registradas.</p>
                ) : categories.map(cat => (
                    <div key={cat.id} className="flex justify-between items-center bg-[var(--card)] border border-[var(--card-border)]/50 p-2.5 px-4 rounded-xl group transition-all hover:border-indigo-500/30 hover:bg-[var(--background)]">
                        {editingId === cat.id ? (
                            <div className="flex-1 flex items-center gap-2">
                                <input
                                    type="text" autoFocus
                                    value={editName} onChange={e => setEditName(e.target.value)}
                                    className="flex-1 bg-[var(--input-bg)] border-none text-[var(--foreground)] text-sm rounded-lg px-2 py-1 outline-none ring-1 ring-[var(--input-border)] focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                />
                                {showIsFixed && (
                                    <label className="flex items-center gap-1.5 text-[10px] text-[var(--muted)] cursor-pointer select-none">
                                        <input type="checkbox" checked={editIsFixed} onChange={e => setEditIsFixed(e.target.checked)} className="rounded-sm accent-indigo-500" />
                                        Fijo
                                    </label>
                                )}
                                <div className="flex gap-1 ml-1">
                                    <button disabled={updating} onClick={() => saveEdit(cat.id)} className="text-emerald-500 hover:bg-emerald-500/10 p-1.5 rounded-lg transition-colors">
                                        {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                    </button>
                                    <button disabled={updating} onClick={cancelEdit} className="text-rose-500 hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <p className="text-[var(--foreground)] font-medium text-sm truncate">{cat.name}</p>
                                    {showIsFixed && cat.is_fixed && (
                                        <span className="text-[9px] tracking-tighter bg-indigo-500/5 text-indigo-500/70 font-bold px-1.5 py-0.5 rounded border border-indigo-500/10 uppercase">
                                            Fijo
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startEdit(cat)} className="text-indigo-400 hover:bg-indigo-400/10 p-2 rounded-xl transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => onRemove(cat.id)} className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-xl transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            <form onSubmit={handleAdd} className="flex gap-3 bg-[var(--background)] p-2 rounded-2xl border border-[var(--card-border)]">
                <input
                    type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Nueva categoría..."
                    className="flex-1 bg-transparent text-[var(--foreground)] text-sm px-3 py-2 outline-none"
                />
                {showIsFixed && (
                    <label className="flex items-center justify-center gap-2 text-xs text-[var(--muted)] font-medium cursor-pointer px-2 border-l border-[var(--card-border)]">
                        <input type="checkbox" checked={isFixed} onChange={e => setIsFixed(e.target.checked)} className="rounded" /> Fijo
                    </label>
                )}
                <button type="submit" disabled={adding || !name.trim()} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-transform active:scale-95 flex items-center justify-center">
                    {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                </button>
            </form>
        </div>
    );
};
