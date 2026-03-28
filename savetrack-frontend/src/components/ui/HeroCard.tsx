import React from 'react';
import { LucideIcon } from 'lucide-react';

interface HeroCardProps {
    label: string;
    amount: string;
    sublabel?: string | React.ReactNode;
    icon: LucideIcon;
    children?: React.ReactNode;
    showSeparator?: boolean;
    className?: string;
}

const HeroCard: React.FC<HeroCardProps> = ({
    label,
    amount,
    sublabel,
    icon: Icon,
    children,
    showSeparator = true,
    className = "",
}) => {
    return (
        <div className={`bg-[#4F46E5] rounded-2xl p-7 relative overflow-hidden shadow-lg ${className}`}>
            {/* Dekoración sutil (glassmorphism style) */}
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />

            {/* Cabecera del Hero Card */}
            <div className="flex items-start justify-between mb-6 relative z-10">
                <div>
                    <p className="text-[10px] font-black text-white uppercase mb-1 tracking-wider opacity-90">
                        {label}
                    </p>
                    <h2 className="text-3xl lg:text-5xl font-black text-white leading-tight">
                        {amount}
                    </h2>
                    {sublabel && (
                        <div className="text-white/60 text-xs font-medium mt-2">
                            {sublabel}
                        </div>
                    )}
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                    <Icon className="w-5 h-5 text-white" />
                </div>
            </div>

            {/* Separador Opcional */}
            {showSeparator && (children) && (
                <div className="h-px bg-white/10 mb-5 relative z-10" />
            )}

            {/* Contenido adicional (slot para mini-cards, progress bars, etc) */}
            {children && (
                <div className="relative z-10">
                    {children}
                </div>
            )}
        </div>
    );
};

export default HeroCard;
