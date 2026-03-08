import React from 'react';
import { Wallet } from 'lucide-react';
import { Account } from '../types';
import { useGlobalSettings } from '@/context/SettingsContext';

// Interfaz para las propiedades de la tarjeta de cuenta
interface AccountCardProps {
    account: Account;
    totalBalance: number;
    onClick: () => void;
}

// Componente para mostrar una tarjeta de cuenta
export const AccountCard: React.FC<AccountCardProps> = ({ account, totalBalance, onClick }) => {
    const { currencySymbol } = useGlobalSettings();
    return (
        <div
            onClick={onClick}
            className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--card-border)] shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
        >
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                    <div className="w-8 h-8 bg-[var(--accent-soft)] rounded-lg flex items-center justify-center text-[var(--accent-text)]">
                        <Wallet className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold bg-[var(--accent-soft)] text-[var(--accent-text)] px-2 py-0.5 rounded-full border border-[var(--card-border)]">
                        {totalBalance > 0 ? `${Math.round((account.balance / totalBalance) * 100)}%` : '0%'}
                    </span>
                </div>
                <h5 className="text-sm font-bold text-[var(--foreground)] leading-tight mb-1">{account.name}</h5>
                <p className="text-xl font-bold text-[var(--accent-text)]">{currencySymbol}{account.balance.toLocaleString()}</p>
                <p className="text-[10px] text-[var(--muted)] mt-1">Toca para ver detalles</p>
            </div>
        </div>
    );
};
