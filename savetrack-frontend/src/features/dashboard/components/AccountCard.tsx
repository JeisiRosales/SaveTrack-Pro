import { Account } from "../types";

interface AccountCardProps {
    account: Account;
    totalBalance: number;
}

export const AccountCard = ({ account, totalBalance }: AccountCardProps) => {
    const percentage = totalBalance > 0
        ? `${Math.round((account.balance / totalBalance) * 100)}%`
        : '0%';

    return (
        <div className="min-w-[240px] bg-[var(--card)] p-4 rounded-xl border border-[var(--card-border)] flex justify-between items-start shadow-sm hover:shadow-md transition-shadow">
            <div>
                <h5 className="text-[10px] font-semibold text-[var(--muted)]">{account.name}</h5>
                <p className="text-lg font-bold mt-2 text-[var(--accent-text)]">
                    ${account.balance.toLocaleString()}
                </p>
            </div>
            <span className="text-[10px] font-bold bg-[var(--accent-soft)] text-[var(--accent-text)] px-2 py-0.5 rounded-full border border-[var(--card-border)]">
                {percentage}
            </span>
        </div>
    );
};