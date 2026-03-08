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

            <div className="space-y-3 max-h-[400px] overflow-y-auto mb-6 pr-2 scrollbar-thin">
                {loading ? <div className="flex items-center gap-2 text-[var(--muted)]"><Loader2 className="w-4 h-4 animate-spin" /> Cargando...</div> : categories.length === 0 ? <p className="text-[var(--muted)] text-sm">No hay categorías registradas.</p> : categories.map(cat => (
                    <div key={cat.id} className="flex justify-between items-center bg-[var(--background)] border border-[var(--card-border)] p-3.5 rounded-2xl group transition-all hover:border-[var(--card-border-hover)]">
                        {editingId === cat.id ? (
                            <div className="flex-1 flex items-center gap-3">
                                <input
                                    type="text" autoFocus
                                    value={editName} onChange={e => setEditName(e.target.value)}
                                    className="flex-1 bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--foreground)] text-sm rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
                                />
                                {showIsFixed && (
                                    <label className="flex items-center gap-1.5 text-xs text-[var(--muted)] cursor-pointer">
                                        <input type="checkbox" checked={editIsFixed} onChange={e => setEditIsFixed(e.target.checked)} className="rounded" />
                                        Fijo
                                    </label>
                                )}
                                <div className="flex gap-1 ml-2">
                                    <button disabled={updating} onClick={() => saveEdit(cat.id)} className="text-emerald-500 hover:bg-emerald-500/10 p-2 rounded-xl transition-colors disabled:opacity-50">
                                        {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    </button>
                                    <button disabled={updating} onClick={cancelEdit} className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-xl transition-colors disabled:opacity-50">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex-1">
                                    <p className="text-[var(--foreground)] font-semibold text-sm">{cat.name}</p>
                                    {showIsFixed && cat.is_fixed && <span className="text-[10px] mt-1 inline-block bg-indigo-500/10 text-indigo-400 font-bold px-2 py-0.5 rounded-lg border border-indigo-500/20">FIJO</span>}
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
