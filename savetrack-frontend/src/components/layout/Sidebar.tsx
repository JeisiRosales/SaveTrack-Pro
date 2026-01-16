import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Wallet,
    Target,
    LogOut,
    Sun,
    Moon,
    ArrowRightLeft,
    Github
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Componente Sidebar Principal
 * Maneja la navegación, el perfil de usuario y el cambio de tema.
 */
const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Estado para el modo oscuro, inicializado según la clase presente en HTML
    const [darkMode, setDarkMode] = useState(() =>
        document.documentElement.classList.contains('dark')
    );

    /**
     * Alterna entre modo claro y oscuro.
     * Modifica la clase en document.documentElement y guarda la preferencia en localStorage.
     */
    const toggleTheme = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        if (newDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <>
            {/* Backdrop para móviles */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-[var(--card)] border-r border-[var(--border)] 
                flex flex-col p-5 transition-transform duration-300 ease-in-out
                lg:translate-x-0 lg:static lg:inset-auto lg:h-auto
                ${isOpen ? 'translate-x-0 shadowed-sidebar' : '-translate-x-full'}
            `}>
                {/* Botón de cierre para móviles */}
                <button
                    onClick={onClose}
                    className="lg:hidden absolute top-5 right-5 p-2 text-[var(--muted)] hover:bg-[var(--background)] rounded-lg"
                >
                    <LogOut className="w-5 h-5 rotate-180" />
                </button>
                {/* Sección de Logo / Branding */}
                <div className="flex items-center gap-3 mb-8 px-2">
                    <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
                        <a>
                            <img src="/logo1.png" alt="Logo" className="w-5 h-5" />
                        </a>
                    </div>
                    <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)]">SaveTrack Pro</h2>
                </div>

                <nav className="flex-1 space-y-1">
                    <NavItem
                        icon={<LayoutDashboard />}
                        label="Dashboard"
                        nav="/dashboard"
                        active={location.pathname === '/dashboard'}
                        onClick={() => navigate('/dashboard')}
                    />
                    <NavItem
                        icon={<Wallet />}
                        label="Cuentas"
                        nav="/accounts"
                        active={location.pathname === '/accounts'}
                        onClick={() => navigate('/accounts')}
                    />
                    <NavItem
                        icon={<Target />}
                        label="Metas"
                        nav="/goals"
                        active={location.pathname === '/goals'}
                        onClick={() => navigate('/goals')}
                    />
                    <NavItem
                        icon={<ArrowRightLeft />}
                        label="Transacciones"
                        nav="/transactions"
                        active={location.pathname === '/transactions'}
                        onClick={() => navigate('/transactions')}
                    />
                </nav>

                {/* Región de Opciones de Usuario y Preferencias */}
                <div className="mt-auto pt-5 border-t border-[var(--border)] space-y-4">

                    {/* Tarjeta de Perfil */}
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-xs">
                            {user?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-bold truncate text-[var(--foreground)]">
                                {user?.full_name || 'Usuario'}
                            </p>
                            <p className="text-[10px] text-[var(--muted)] truncate">{user?.email}</p>
                        </div>
                    </div>

                    {/* Interruptor de Tema */}
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[var(--background)] transition-colors text-[var(--muted)] hover:text-indigo-600"
                        title="Cambiar tema de la aplicación"
                    >
                        <div className="flex items-center gap-2">
                            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            <span className="text-xs font-medium">{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
                        </div>
                        {/* Botón de switch estilizado */}
                        <div className={`w-8 h-4 rounded-full relative transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${darkMode ? 'left-4.5' : 'left-0.5'}`} />
                        </div>
                    </button>

                    {/* Botón de Cerrar Sesión */}
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm">Cerrar Sesión</span>
                    </button>

                    <div className="border-t border-slate-50 flex justify-center">
                        <a
                            href="https://github.com/JeisiRosales"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 text-[10px] text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300 group shadow-sm border border-slate-100"
                        >
                            <Github className="w-3 h-3 transition-transform group-hover:scale-110" />
                            <span className="font-bold uppercase tracking-wider">
                                Entra a mi GitHub
                            </span>
                        </a>
                    </div>
                </div>
            </aside>
        </>
    );
};

/**
 * Componente Auxiliar para los items de navegación
 */
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