import { useState } from 'react';
import { SettingsForm } from '@/features/user-settings/components/SettingsForm';
import { useAuth } from '@/context/AuthContext';
import { User, Sun, Moon, Briefcase } from 'lucide-react';

const Settings = () => {
    const { user } = useAuth();
    const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

    const toggleTheme = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <div className="flex-1 p-6 lg:p-10 relative overflow-x-hidden">
            <header className="mb-8">
                <div className="flex items-center gap-2 mb-1">
                    <User className="w-6 h-6 text-[var(--accent-text)]" />
                    <h1 className="text-xl lg:text-2xl font-bold text-[var(--foreground)]">Configuración y Perfil</h1>
                </div>
                <p className="text-[var(--muted)] text-xs font-medium">Administra tu cuenta, tema visual y finanzas automáticas.</p>
            </header>

            <div className="flex flex-col lg:flex-row gap-8 max-w-6xl">

                {/* Columna Izquierda: Perfil y Peligro */}
                <div className="w-full lg:w-1/3 flex flex-col gap-6">
                    {/* Tarjeta de Perfil Profesional */}
                    <div className="bg-[var(--card)] p-6 rounded-3xl border border-[var(--card-border)] shadow-sm text-center">
                        <div className="w-24 h-24 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-4xl mx-auto mb-4 border-4 border-[var(--background)] shadow-lg shadow-indigo-500/10">
                            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <h2 className="text-xl font-bold text-[var(--foreground)]">{user?.full_name || 'Usuario Pro'}</h2>
                        <p className="text-sm text-[var(--muted)] mb-5">{user?.email}</p>

                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold border border-emerald-500/20">
                            <Briefcase className="w-3 h-3" /> Cuenta Activa
                        </div>
                    </div>

                    {/* Apariencia Visual */}
                    <div className="bg-[var(--card)] p-5 rounded-3xl border border-[var(--card-border)] shadow-sm">
                        <h3 className="font-bold text-[var(--foreground)] mb-3 text-sm">Apariencia</h3>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--background)] border border-[var(--card-border)] cursor-pointer hover:border-indigo-500/30 transition-colors" onClick={toggleTheme}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-orange-500/20 text-orange-500'}`}>
                                    {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-[var(--foreground)]">Tema de la App</p>
                                    <p className="text-[10px] text-[var(--muted)]">{darkMode ? 'Modo Oscuro' : 'Modo Claro'}</p>
                                </div>
                            </div>
                            <div className={`w-10 h-6 flex items-center bg-gray-300 rounded-full p-1 duration-300 ease-in-out ${darkMode ? 'bg-indigo-500' : ''}`}>
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${darkMode ? 'translate-x-4' : ''}`}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Formulario Central de Finances */}
                <div className="w-full lg:w-2/3">
                    <SettingsForm />
                </div>

            </div>
        </div>
    );
};

export default Settings;
