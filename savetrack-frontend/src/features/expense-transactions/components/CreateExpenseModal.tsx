import React, { useState } from 'react';
import { useExpenseTransactions } from '../hooks/useExpenseTransactions';
import { X, Loader2 } from 'lucide-react';
import { useGlobalSettings } from '@/context/SettingsContext';

interface Props {
    isOpen: boolean; // Flag que indica visibilidad
    onClose: () => void; // Disparador para cerrar la modal
}

/**
 * Componente `<CreateExpenseModal />`
 * Diálogo modal estético y fluido para registrar velozmente nuevos gastos en el sistema.
 * 
 * TODO: En futuras refactorizaciones implementar los Dropdowns de 
 * `<AccountSelector />` y `<CategorySelector />` para mejor experiencia de usuario.
 */
export const CreateExpenseModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const { add } = useExpenseTransactions();

    // Estado interno del formulario
    const [amount, setAmount] = useState('');
    const [desc, setDesc] = useState('');
    const [accountId, setAccountId] = useState('');
    const [catId, setCatId] = useState('');
    const [loading, setLoading] = useState(false);

    const { currencySymbol } = useGlobalSettings();

    // Evita renderizar estructuras del DOM extra temporalmente
    if (!isOpen) return null;

    /**
     * Envía la estructura completada delegándola al custom hook
     * que enlazará con la API backend.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await add({
                account_id: accountId,
                category_id: catId,
                amount: Number(amount),
                description: desc
            });
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Capa de Difuminado de Fondo Oscuro */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

            {/* Contenedor Flotante Estilizado */}
            <div className="relative bg-[#12141c] w-full max-w-sm rounded-3xl p-6 border border-white/10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Nuevo Gasto</h2>
                    <button onClick={onClose}><X className="text-gray-400 w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ID de Cuenta (Placeholder simple) */}
                    <input type="text" placeholder="ID de Cuenta" required onChange={e => setAccountId(e.target.value)} className="w-full bg-black/20 border border-white/10 text-white text-sm rounded-xl p-3" />

                    {/* ID de Categoría (Placeholder simple) */}
                    <input type="text" placeholder="ID de Categoría" onChange={e => setCatId(e.target.value)} className="w-full bg-black/20 border border-white/10 text-white text-sm rounded-xl p-3" />

                    {/* Valor de Monto Destacado */}
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500/50 font-black text-xl">{currencySymbol}</span>
                        <input
                            type="number"
                            placeholder="Monto"
                            required
                            step="0.01"
                            onChange={e => setAmount(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 text-white text-xl font-bold rounded-xl p-4 pl-12 text-center placeholder:font-normal"
                        />
                    </div>

                    {/* Descripción Opcional Expandida */}
                    <input type="text" placeholder="Concepto (Opcional)" onChange={e => setDesc(e.target.value)} className="w-full bg-black/20 border border-white/10 text-white text-sm rounded-xl p-3" />

                    {/* Boton Invocador */}
                    <button disabled={loading} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold p-4 rounded-xl transition-all shadow-xl shadow-rose-900/20">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Registrar Gasto'}
                    </button>
                </form>
            </div>
        </div>
    );
};
