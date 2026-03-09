import { useState, useRef, useEffect } from 'react';
import { SettingsForm } from '@/features/user-settings/components/SettingsForm';
import { useAuth } from '@/context/AuthContext';
import { User, Sun, Moon, Briefcase, Menu, Pencil, Check, X, Loader2 } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

interface ContextType {
    toggleSidebar: () => void;
}

const Settings = () => {
    const { user, updateProfile } = useAuth();
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState(user?.full_name);
    const [isSaving, setIsSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
    const { toggleSidebar } = useOutletContext<ContextType>();

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

    // Foco automático al abrir el modo edición
    useEffect(() => {
        if (isEditingName && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditingName]);

    const handleSaveName = async () => {
        if (!newName.trim() || newName === user?.full_name) {
            setIsEditingName(false);
            return;
        }

        setIsSaving(true);
        try {
            await updateProfile({ full_name: newName.trim() });
            setIsEditingName(false);
        } catch (error) {
            alert("Error al actualizar el nombre");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setNewName(user?.full_name || '');
        setIsEditingName(false);
    };

    return (
        <div className="flex-1 p-6 lg:p-10 relative overflow-x-hidden">
            <header className="mb-8 flex items-center justify-between gap-4">
                {/* Contenedor de Texto e Icono */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <User className="w-6 h-6 text-[var(--accent-text)]" />
                        <h1 className="text-xl lg:text-2xl font-bold text-[var(--foreground)] leading-tight">
                            Configuración y Perfil
                        </h1>
                    </div>
                    <p className="text-[var(--muted)] text-xs font-medium">
                        Administra tu cuenta, tema visual y finanzas automáticas.
                    </p>
                </div>

                {/* Botón de Menú (Solo visible en móvil) */}
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-3 bg-[var(--card)] border border-[var(--card-border)] rounded-xl hover:bg-[var(--background)] transition-colors shrink-0"
                >
                    <Menu className="w-6 h-6 text-[var(--foreground)]" />
                </button>
            </header>

            <div className="flex flex-col lg:flex-row gap-8 max-w-6xl">

                {/* Columna Izquierda: Perfil y Peligro */}
                <div className="w-full lg:w-1/3 flex flex-col gap-6">
                    {/* Tarjeta de Perfil Profesional */}
                    <div className="bg-[var(--card)] p-6 rounded-3xl border border-[var(--card-border)] shadow-sm text-center">
                        {/* Contenedor del Avatar con posición relativa para el lápiz */}
                        <div className="relative w-24 h-24 mx-auto mb-4">
                            <div className="w-full h-full rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-4xl border-4 border-[var(--background)] shadow-lg shadow-indigo-500/10">
                                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                            </div>

                            {!isEditingName && (
                                <button
                                    onClick={() => setIsEditingName(true)}
                                    className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full border-4 border-[var(--card)] flex items-center justify-center shadow-md transition-all active:scale-90"
                                    title="Editar nombre"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {isEditingName ? (
                            <div className="flex items-center justify-center gap-2 mb-1 w-full max-w-sm mx-auto">
                                {/* Input con ancho flexible para que no empuje los botones fuera de la tarjeta */}
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSaveName();
                                        if (e.key === "Escape") handleCancel();
                                    }}
                                    disabled={isSaving}
                                    className="flex-1 min-w-[120px] text-center bg-[var(--background)] border border-indigo-500 rounded-lg px-2 py-1 text-lg font-bold text-[var(--foreground)] outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />

                                {/* Contenedor de botones alineado horizontalmente */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                        onClick={handleSaveName}
                                        disabled={isSaving}
                                        className="p-1.5 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors disabled:opacity-50 shadow-sm active:scale-90"
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                        className="p-1.5 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors shadow-sm active:scale-90"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <h2 className="text-xl font-bold text-[var(--foreground)]">
                                {user?.full_name || 'Usuario Pro'}
                            </h2>
                        )}
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
            <p className="text-xl text-[var(--muted)] mt-6 max-w-sm items-center justify-center text-center">
                Hecho con cariño<span className="text-rose-500">IA</span>mor jajaja
            </p>
        </div>
    );
};

export default Settings;
