import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
    value: string;
    label: string;
    icon?: React.ReactNode;
}

interface CustomSelectProps {
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = "Seleccionar...",
    disabled = false,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                className={`w-full flex items-center justify-between px-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-sm 
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-500/50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'} 
                    transition-all shadow-sm text-left`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {selectedOption?.icon && <span className="text-[var(--muted)]">{selectedOption.icon}</span>}
                    <span className={`block truncate ${!selectedOption ? 'text-[var(--muted-foreground)]' : 'text-[var(--foreground)]'}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-[var(--muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-[var(--card)] border border-[var(--card-border)] rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <ul className="max-h-60 overflow-y-auto py-1 scrollbar-hide">
                        {options.map((option) => (
                            <li
                                key={option.value}
                                className={`flex items-center justify-between px-4 py-3 cursor-pointer text-sm transition-colors
                                    ${option.value === value
                                        ? 'bg-indigo-500/10 text-indigo-500 font-medium'
                                        : 'text-[var(--foreground)] hover:bg-[var(--background)] hover:text-[var(--accent-text)]'
                                    }`}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    {option.icon && <span className="opacity-70">{option.icon}</span>}
                                    {option.label}
                                </div>
                                {option.value === value && <Check className="w-4 h-4" />}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
