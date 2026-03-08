import React from 'react';
import { Wallet } from 'lucide-react';
import { Account } from '../types';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { useGlobalSettings } from '@/context/SettingsContext';

interface AccountSelectorProps {
    label: string;
    accounts: Account[];
    selectedId: string;
    onSelect: (id: string) => void;
    placeholder: string;
}

export const AccountSelector: React.FC<AccountSelectorProps> = ({
    label,
    accounts,
    selectedId,
    onSelect,
    placeholder
}) => {
    const { currencySymbol } = useGlobalSettings();

    const accountOptions = accounts.map(acc => ({
        value: acc.id,
        label: `${acc.name} - ${currencySymbol}${acc.balance.toLocaleString()}`,
        icon: <Wallet className="w-4 h-4" />
    }));

    return (
        <div className="space-y-2 relative">
            <label className="block text-[11px] font-black text-[var(--muted)] uppercase ml-1">
                {label}
            </label>
            <CustomSelect
                options={accountOptions}
                value={selectedId}
                onChange={(val) => onSelect(val)}
                placeholder={placeholder}
            />
        </div>
    );
};
