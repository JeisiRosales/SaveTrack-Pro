import React from 'react';
import { Calendar, Plus, Minus, ArrowRightLeft } from 'lucide-react';
import { Transaction } from '../types';
import { useGlobalSettings } from '@/context/SettingsContext';

interface TransactionsTableProps {
    transactions: Transaction[];
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions }) => {
    const { currencySymbol } = useGlobalSettings();

    return (
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--card-border)] overflow-hidden shadow-sm">
            {transactions.length === 0 ? (
                <div className="p-20 text-center">
                    <p className="text-[var(--muted)] font-medium">No se encontraron transacciones.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--background)] border-b border-[var(--card-border)]">
                                <th className="px-6 py-4 text-[10px] font-bold text-[var(--muted)] uppercase">Fecha</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-[var(--muted)] uppercase">Flujo</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-[var(--muted)] uppercase">Cuenta Origen</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-[var(--muted)] uppercase">Tipo</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-[var(--muted)] uppercase text-right">Monto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--card-border)]">
                            {transactions.map((t: any) => {
                                const isPositive = t.isPositive;
                                const isGoalAction = t.universalType === 'goal_deposit' || t.universalType === 'goal_withdrawal';
                                const isExpense = t.universalType === 'expense';
                                const isIncome = t.universalType === 'income';

                                let typeLabel = 'Desconocido';
                                let subTitle = t.categoryName || '';

                                // Lógica de etiquetas
                                if (isExpense) { typeLabel = 'Gasto'; }
                                else if (isIncome) { typeLabel = 'Ingreso'; }
                                else if (t.universalType === 'goal_deposit') { typeLabel = 'Hacia Meta'; subTitle = 'Ahorro'; }
                                else if (t.universalType === 'goal_withdrawal') { typeLabel = 'Desde Meta'; subTitle = 'Liberación'; }

                                // Clases de colores condicionales
                                const badgeColorClass = isGoalAction
                                    ? 'bg-[var(--card-border)] text-[var(--muted)]' // Neutro para metas
                                    : isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500';

                                const textColorClass = isGoalAction
                                    ? 'text-[var(--foreground)]' // Color de texto normal para metas
                                    : isPositive ? 'text-emerald-500' : 'text-rose-500';

                                return (
                                    <tr key={t.id} className="hover:bg-[var(--background)] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-[var(--muted)]" />
                                                <span className="text-xs font-medium">{t.created_at ? new Date(t.created_at).toLocaleDateString() : '---'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-[var(--foreground)] truncate max-w-[200px]">
                                                    {t.entityName}
                                                </span>
                                                <span className="text-[10px] text-[var(--muted)] font-medium italic mt-0.5">
                                                    {subTitle}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-[var(--accent-soft)] text-[var(--accent-text)] text-[10px] font-bold rounded-lg uppercase">
                                                {t.funding_accounts?.name || 'Desconocida'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${badgeColorClass}`}>
                                                    {isGoalAction ? (
                                                        <ArrowRightLeft className="w-3 h-3" /> // Icono neutro para traspasos
                                                    ) : (
                                                        isPositive ? <Plus className="w-3 h-3" /> : <Minus className="w-3 h-3" />
                                                    )}
                                                </div>
                                                <span className={`text-xs font-bold ${textColorClass}`}>
                                                    {typeLabel}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`text-sm font-black ${textColorClass}`}>
                                                {isGoalAction ? '' : (isPositive ? '+' : '-')}{currencySymbol}{t.amount?.toLocaleString() || '0'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};