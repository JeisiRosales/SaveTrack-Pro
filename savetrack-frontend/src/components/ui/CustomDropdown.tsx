import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
    value: string;
    label: string;
    icon?: React.ReactNode;
}

interface CustomDropdownProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    icon?: React.ReactNode;
    className?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
    options,
    value,
    onChange,
    placeholder = "Seleccionar...",
    icon,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selectedOption = options.find(opt => opt.value === value);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-3 px-4 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-sm font-medium hover:bg-[var(--accent-soft)] transition-all outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
                <div className="flex items-center gap-2 truncate">
                    {icon && <span className="text-[var(--muted)]">{icon}</span>}
                    <span className={selectedOption ? "text-[var(--foreground)]" : "text-[var(--muted)]"}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-[var(--muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-full min-w-[200px] bg-[var(--card)] border border-[var(--card-border)] rounded-2xl shadow-xl py-2 animate-in fade-in zoom-in duration-200">
                    <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent-text)] ${value === option.value
                                        ? 'bg-[var(--accent-soft)] text-[var(--accent-text)] font-bold'
                                        : 'text-[var(--foreground)] font-medium'
                                    }`}
                            >
                                <div className="flex items-center gap-2 truncate">
                                    {option.icon && <span className="opacity-70">{option.icon}</span>}
                                    <span>{option.label}</span>
                                </div>
                                {value === option.value && <Check className="w-4 h-4 flex-shrink-0" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;
