import { Plus } from "lucide-react";
import { Transaction } from "../types";

import { useGlobalSettings } from "@/context/SettingsContext";

// Interfaz para las propiedades del item de transacción
export const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
    const { currencySymbol } = useGlobalSettings();
    // Determina si la transacción es un depósito
    const isDeposit = transaction.type === 'deposit';

    return (
        <div className="p-4 flex items-center justify-between hover:bg-[var(--background)] transition-colors">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDeposit ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    <Plus className={`w-4 h-4 ${!isDeposit && 'rotate-45'}`} />
                </div>
                <div>
                    <h5 className="font-semibold text-[var(--foreground)] text-xs capitalize">
                        {isDeposit ? 'Depósito' : 'Retiro'}
                    </h5>
                    <p className="text-[10px] text-[var(--muted)]">
                        {transaction.funding_accounts?.name} → {transaction.savings_goals?.name || 'General'}
                    </p>
                </div>
            </div>
            <div className="text-right">
                <p className={`text-sm font-bold ${isDeposit ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {isDeposit ? '+' : '-'}{currencySymbol}{transaction.amount.toLocaleString()}
                </p>
                <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
                    {new Date(transaction.created_at).toLocaleDateString()}
                </p>
            </div>
        </div>
    );
};
