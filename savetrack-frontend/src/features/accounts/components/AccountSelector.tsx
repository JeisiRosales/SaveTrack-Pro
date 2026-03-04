import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Account } from '../types';

// Interfaz para las propiedades del selector de cuentas
interface AccountSelectorProps {
    label: string;
    accounts: Account[];
    selectedId: string;
    onSelect: (id: string) => void;
    placeholder: string;
}

// Componente para seleccionar una cuenta
export const AccountSelector: React.FC<AccountSelectorProps> = ({
    label,
    accounts,
    selectedId,
    onSelect,
    placeholder
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedAccount = accounts.find(a => a.id === selectedId);

    return (
        <div className="space-y-2 relative">
            <label className="block text-[11px] font-black text-[var(--muted)] uppercase ml-1">
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
