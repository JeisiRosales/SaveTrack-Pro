import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, PiggyBank, LogOut, ArrowRightLeft, Github, Tags, Settings, TrendingUp, TrendingDown } from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-[var(--card)] border-r border-[var(--card-border)] 
                flex flex-col p-5 transition-transform duration-300 ease-in-out overflow-y-auto
                lg:translate-x-0
                ${isOpen ? 'translate-x-0 shadowed-sidebar' : '-translate-x-full'}
            `}>
                <button
                    onClick={onClose}
                    className="lg:hidden absolute top-5 right-5 p-2 text-[var(--muted)] hover:bg-[var(--background)] rounded-lg transition-colors"
                >
                    <LogOut className="w-5 h-5 rotate-180" />
                </button>

                <div className="flex items-center gap-3 mb-8 px-2">
                    <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
                        <a>
                            <img src="/logo1.png" alt="Logo" className="w-5 h-5" />
                        </a>
                    </div>
                    <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)]">SaveTrack Pro</h2>
                </div>

                <nav className="flex-1 space-y-1">
                    <NavItem icon={<LayoutDashboard />} label="Dashboard" nav="/dashboard" active={location.pathname === '/dashboard'} onClick={() => { navigate('/dashboard'); onClose(); }} />
                    <NavItem icon={<Wallet />} label="Cuentas" nav="/accounts" active={location.pathname === '/accounts'} onClick={() => { navigate('/accounts'); onClose(); }} />
                    <NavItem icon={<PiggyBank />} label="Metas" nav="/goals" active={location.pathname === '/goals'} onClick={() => { navigate('/goals'); onClose(); }} />
                    <NavItem icon={<TrendingUp />} label="Ingresos" nav="/incomes" active={location.pathname === '/incomes'} onClick={() => { navigate('/incomes'); onClose(); }} />
                    <NavItem icon={<TrendingDown />} label="Gastos" nav="/expenses" active={location.pathname === '/expenses' || location.pathname === '/savings'} onClick={() => { navigate('/expenses'); onClose(); }} />
                    <NavItem icon={<ArrowRightLeft />} label="Transacciones" nav="/transactions" active={location.pathname === '/transactions'} onClick={() => { navigate('/transactions'); onClose(); }} />
                    <NavItem icon={<Tags />} label="Categorías" nav="/categories" active={location.pathname === '/categories'} onClick={() => { navigate('/categories'); onClose(); }} />
                    <NavItem icon={<Settings />} label="Configuración" nav="/settings" active={location.pathname === '/settings'} onClick={() => { navigate('/settings'); onClose(); }} />
                </nav>

                <div className="mt-auto border-t border-[var(--card-border)] pt-4 flex justify-center">
                    <a href="https://github.com/JeisiRosales" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--background)] text-[10px] text-[var(--muted)] hover:text-[var(--accent-text)] hover:bg-[var(--accent-soft)] transition-all duration-300 group shadow-sm border border-[var(--card-border)]">
                        <Github className="w-3 h-3 transition-transform group-hover:scale-110" />
                        <span className="font-bold uppercase tracking-wider">Entra a mi GitHub</span>
                    </a>
                </div>
            </aside>
        </>
    );
};

interface NavItemProps {
    icon: React.ReactElement;
    label: string;
    nav: string;
    active?: boolean;
    onClick?: () => void;
}

const NavItem = ({ icon, label, active = false, onClick }: NavItemProps) => (
    <div
        onClick={onClick}
        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${active
            ? 'bg-[#4B56D210] text-[#4B56D2] font-bold'
            : 'text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]'
            }`}>
        {React.cloneElement(icon, { className: "w-5 h-5" } as React.HTMLAttributes<HTMLElement>)}
        <span className="text-sm">{label}</span>
    </div>
);

export default Sidebar;