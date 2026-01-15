import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Wallet,
    Target,
    LogOut,
    Sun,
    Moon,
    ArrowRightLeft
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
                fixed inset-y-0 left-0 z-50 w-72 bg-[var(--card)] border-r border-[var(--border)] 
                flex flex-col p-6 transition-transform duration-300 ease-in-out
                lg:translate-x-0 lg:static lg:inset-auto lg:h-auto
                ${isOpen ? 'translate-x-0 shadowed-sidebar' : '-translate-x-full'}
            `}>
                {/* Botón de cierre para móviles */}
                <button
                    onClick={onClose}
                    className="lg:hidden absolute top-6 right-6 p-2 text-[var(--muted)] hover:bg-[var(--background)] rounded-lg"
                >
                    <LogOut className="w-5 h-5 rotate-180" />
                </button>
                {/* Sección de Logo / Branding */}
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-10 h-10 bg-[#4B56D2] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">
                        <a>
                            <img src="/logo1.png" alt="Logo" className="w-6 h-6" />
                        </a>
                    </div>
                    <h2 className="text-xl font-black tracking-tight text-[var(--foreground)]">SaveTrack Pro</h2>
                </div>

                <nav className="flex-1 space-y-2">
                    <NavItem icon={<LayoutDashboard />} label="Dashboard" active />
                    <NavItem icon={<Wallet />} label="Cuentas" />
                    <NavItem icon={<Target />} label="Metas" />
                    <NavItem icon={<ArrowRightLeft />} label="Transacciones" />
                </nav>

                {/* Región de Opciones de Usuario y Preferencias */}
                <div className="mt-auto pt-6 border-t border-[var(--border)] space-y-4">

                    {/* Tarjeta de Perfil: Muestra iniciales y datos del usuario autenticado */}
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--background)] border border-[var(--border)]">
                        <div className="w-10 h-10 rounded-full bg-[#4B56D220] text-[#4B56D2] flex items-center justify-center font-bold">
                            {user?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold truncate text-[var(--foreground)]">
                                {user?.full_name || 'Usuario'}
                            </p>
                            <p className="text-xs text-[var(--muted)] truncate">{user?.email}</p>
                        </div>
                    </div>

                    {/* Interruptor de Tema: Alterna entre el icono de Sol/Luna y visualiza el estado */}
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--background)] transition-colors text-[var(--muted)] hover:text-[#4B56D2]"
                        title="Cambiar tema de la aplicación"
                    >
                        <div className="flex items-center gap-3">
                            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            <span className="text-sm font-medium">{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
                        </div>
                        {/* Botón de switch estilizado */}
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${darkMode ? 'bg-[#4B56D2]' : 'bg-gray-300'}`}>
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${darkMode ? 'left-6' : 'left-1'}`} />
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
                </div>
            </aside>
        </>
    );
};

/**
 * Componente Auxiliar para los items de navegación
 */
const NavItem = ({ icon, label, active = false }: { icon: React.ReactElement, label: string, active?: boolean }) => (
    <div className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${active
        ? 'bg-[#4B56D210] text-[#4B56D2] font-bold'
        : 'text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]'
        }`}>
        {React.cloneElement(icon, { className: "w-5 h-5" } as React.HTMLAttributes<HTMLElement>)}
        <span className="text-sm">{label}</span>
    </div>
);

export default Sidebar;