import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Minus, Loader2, ChevronDown } from 'lucide-react';
import api from '../../lib/api';

const AccountSelector = ({
    label,
    accounts,
    selectedId,
    onSelect,
    placeholder
}: {
    label: string,
    accounts: any[],
    selectedId: string,
    onSelect: (id: string) => void,
    placeholder: string
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedAccount = accounts.find(a => a.id === selectedId);

    return (
        <div className="space-y-2 relative">
            <label className="text-xs font-black text-gray-500 ml-1 uppercase">
                {label}
            </label>

            {/* Trigger del Dropdown */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between bg-[var(--input-bg)] border ${isOpen ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-[var(--input-border)]'} rounded-2xl p-4 cursor-pointer transition-all hover:border-indigo-500/50`}
            >
                {selectedAccount ? (
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-[var(--foreground)]">{selectedAccount.name}</span>
                        <span className="text-[10px] text-[var(--accent-text)] font-medium">${selectedAccount.balance.toLocaleString()}</span>
                    </div>
                ) : (
                    <span className="text-sm text-[var(--muted)] font-semibold">{placeholder}</span>
                )}
                <ChevronDown className={`w-5 h-5 text-[var(--muted)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Menú Desplegable */}
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[110]" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-[var(--card)] border border-[var(--card-border)] rounded-2xl shadow-xl z-[120] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="max-h-60 overflow-y-auto p-2">
                            {accounts.length > 0 ? accounts.map((acc) => (
                                <div
                                    key={acc.id}
                                    onClick={() => {
                                        onSelect(acc.id);
                                        setIsOpen(false);
                                    }}
                                    className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--accent-soft)] transition-colors cursor-pointer group"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-[var(--foreground)] group-hover:text-[var(--accent-text)]">{acc.name}</span>
                                        <span className="text-[10px] text-[var(--muted)]">${acc.balance.toLocaleString()}</span>
                                    </div>
                                    {selectedId === acc.id && (
                                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                    )}
                                </div>
                            )) : (
                                <div className="p-4 text-center text-xs text-[var(--muted)]">No hay cuentas disponibles</div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    goalId: string | undefined;
    onSuccess: () => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, goalId, onSuccess }) => {
    const [type, setType] = useState<'deposit' | 'withdrawal'>('deposit');
    const [amount, setAmount] = useState('');
    const [accountId, setAccountId] = useState('');
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Estados para el Dropdown Personalizado
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen) {
            api.get('/funding-accounts').then(res => setAccounts(res.data));
            setError(null);
        }
    }, [isOpen]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accountId) { setError('Por favor selecciona una cuenta'); return; }
        setLoading(true);
        try {
            await api.post('/transactions', {
                goalId,
                accountId: accountId,
                type,
                amount: Number(amount)
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error en la transacción');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

            <div className="relative bg-[#12141c] w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-white tracking-tight">Movimiento</h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Toggle Tipo */}
                    <div className="flex p-1.5 bg-black/20 border border-white/5 rounded-2xl mb-4 mt-4">
                        <button
                            type="button"
                            onClick={() => setType('deposit')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${type === 'deposit' ? 'bg-[#4f46e5] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Plus className="w-4 h-4" /> Depósito
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('withdrawal')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${type === 'withdrawal' ? 'bg-rose-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Minus className="w-4 h-4" /> Retiro
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AccountSelector
                            label="Cuenta de origen"
                            placeholder="¿De dónde viene el dinero?"
                            accounts={accounts}
                            selectedId={accountId}
                            onSelect={(id) => setAccountId(id)}
                        />
                        {/* Input Monto */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-500 ml-1 uppercase">Monto a transferir</label>
                            <div className="relative group">
                                <input
                                    type="number" required step="0.01" value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="text-sm text-[var(--muted)] font-semibold w-full flex items-center justify-between bg-[var(--input-bg)] border border-[var(--input-border)] mt-0.5 rounded-2xl py-4 px-5 outline-none focus:border-[var(--primary)] transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        {error && <p className="text-rose-500 text-xs font-bold text-center">{error}</p>}

                        <button
                            disabled={loading}
                            className={`w-full py-5 rounded-2xl font-black text-xs text-white shadow shadow-indigo-500/10 transition-all active:scale-95 flex items-center justify-center gap-3 ${type === 'deposit'
                                ? 'bg-[#4f46e5] hover:bg-[#4338ca] shadow-indigo-500/20'
                                : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                                }`}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Transferencia'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TransactionModal;
function setIsDropdownOpen(_arg0: boolean) {
    throw new Error('Function not implemented.');
}

