import React from 'react';
import { Wallet } from 'lucide-react';
import { Account } from '../types';
import { useGlobalSettings } from '@/context/SettingsContext';

interface AccountCardProps {
    account: Account;
    totalBalance: number;
    onClick: () => void;
    isSavings?: boolean;
}

export const AccountCard: React.FC<AccountCardProps> = ({ account, totalBalance, onClick, isSavings }) => {
    const { currencySymbol } = useGlobalSettings();

    return (
        <div
            onClick={onClick}
            className={`bg-[var(--card)] p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden ${isSavings
                ? 'border-indigo-500/40 ring-1 ring-indigo-500/20'
                : 'border-[var(--card-border)]'
                }`}
        >
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSavings
                        ? 'bg-indigo-500/10 text-indigo-500'
                        : 'bg-[var(--accent-soft)] text-[var(--accent-text)]'
                        }`}>
                        <Wallet className="w-4 h-4" />
                    </div>

                    <div className="flex items-center gap-1.5">
                        {isSavings && (
                            <><span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                Ahorro
                            </span><span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                    Sumar total ahorrado
                                </span></>
                        )}
                        <span className="text-[10px] font-bold bg-[var(--accent-soft)] text-[var(--accent-text)] px-2 py-0.5 rounded-full border border-[var(--card-border)]">
                            {totalBalance > 0 ? `${Math.round((account.balance / totalBalance) * 100)}%` : '0%'}
                        </span>
                    </div>
                </div>

                <h5 className="text-sm font-bold text-[var(--foreground)] leading-tight mb-1">{account.name}</h5>
                <p className={`text-xl font-bold ${isSavings ? 'text-indigo-400' : 'text-[var(--accent-text)]'}`}>
                    {currencySymbol}{account.balance.toLocaleString()}
                </p>
                <p className="text-[10px] text-[var(--muted)] mt-1">Toca para ver detalles</p>
            </div>
        </div>
    );
};