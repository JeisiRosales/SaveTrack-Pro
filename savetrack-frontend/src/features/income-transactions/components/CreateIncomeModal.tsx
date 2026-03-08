import React, { useState } from 'react';
import { useIncomeTransactions } from '../hooks/useIncomeTransactions';
import { X, Loader2 } from 'lucide-react';
// IMPORTANTE: Necesitarás el AccountSelector y IncomeCategorySelector

interface Props {
    isOpen: boolean; // Flag para montaje o desmontaje
    onClose: () => void; // Disparador para ocultar el modal
}

/**
 * Modal dinámico para Generación de Ingresos (`<CreateIncomeModal />`)
 * Esta variante es distinta a los Gastos ya que incorpora una opción de "Auto-Ahorro".
 * Si "Auto Save" es tildado, la bandera perform_auto_save se incrusta en el payload.
 */
export const CreateIncomeModal: React.FC<Props> = ({ isOpen, onClose }) => {
    // Suscripción al API de Ingresos
    const { add } = useIncomeTransactions();

    // Controles reactivos del formulario base
    const [amount, setAmount] = useState('');
    const [desc, setDesc] = useState('');
    const [accountId, setAccountId] = useState('');
    const [catId, setCatId] = useState('');

    // Switch de inteligencia: Habilita descuentos automáticos hacia cuentas de metas
    const [autoSave, setAutoSave] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    /**
     * Disparado por el action 'submit'. Ensambla los datos, bloquea la UI,
     * remite al custom hook y cierra todo silenciosamente en el finally.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await add({
                account_id: accountId,
                category_id: catId,
                amount: Number(amount),
                description: desc,
                // El backend recibirá este flag y descontará silenciosamente el monto % configurado.
                perform_auto_save: autoSave
            });
            onClose();
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
            <div className="relative bg-[#12141c] w-full max-w-sm rounded-3xl p-6 border border-white/10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Nuevo Ingreso</h2>
                    <button onClick={onClose}><X className="text-gray-400 w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ID de Cuenta */}
                    <input type="text" placeholder="ID de Cuenta" required onChange={e => setAccountId(e.target.value)} className="w-full bg-black/20 border border-white/10 text-white text-sm rounded-xl p-3" />

                    {/* Selector Categórico */}
                    <input type="text" placeholder="ID de Categoría" onChange={e => setCatId(e.target.value)} className="w-full bg-black/20 border border-white/10 text-white text-sm rounded-xl p-3" />

                    {/* Pantalla o Display Interactivo para el monto */}
                    <input type="number" placeholder="Monto Total" required step="0.01" onChange={e => setAmount(e.target.value)} className="w-full bg-black/20 border border-white/10 text-emerald-400 text-xl font-bold rounded-xl p-4 text-center placeholder:text-emerald-900 placeholder:font-normal" />

                    {/* Nota extra o justificante */}
                    <input type="text" placeholder="Concepto (Opcional)" onChange={e => setDesc(e.target.value)} className="w-full bg-black/20 border border-white/10 text-white text-sm rounded-xl p-3" />

                    {/* Toggle Selector Exclusivo del Ingreso: "Ahorro Automático" */}
                    <label className="flex items-center gap-3 bg-white/5 border border-emerald-500/20 p-4 rounded-xl cursor-pointer hover:bg-emerald-500/10 transition-colors">
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-emerald-400">Auto-Ahorro</p>
                            <p className="text-xs text-gray-400">Guarda parte en tu cuenta destino</p>
                        </div>
                        <input
                            type="checkbox"
                            onChange={e => setAutoSave(e.target.checked)}
                            className="w-5 h-5 accent-emerald-500 rounded bg-black/20 border-white/10"
                        />
                    </label>

                    {/* Botón de Emisión/Sometimiento */}
                    <button disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold text-white p-4 rounded-xl transition-all shadow-xl shadow-emerald-900/20">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Registrar Ingreso'}
                    </button>
                </form>
            </div>
        </div>
    );
};
