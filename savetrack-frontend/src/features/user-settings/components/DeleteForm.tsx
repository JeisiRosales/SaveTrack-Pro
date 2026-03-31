import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DeleteAccountModal } from './DeleteAccountModal';
import { AlertTriangle, LogOut, Trash2 } from 'lucide-react';

export const DeleteForm = () => {
    const { logout } = useAuth();
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    return (
        <>
            <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-3 text-rose-500">
                    <AlertTriangle className="w-5 h-5" />
                    <h2 className="text-lg font-bold">Zona de Riesgo</h2>
                </div>

                {/* Cerrar sesión */}
                <div className="bg-[var(--background)] border border-rose-500/20 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-bold text-[var(--foreground)]">Cerrar Sesión</p>
                        <p className="text-xs text-[var(--muted)] mt-0.5">
                            Salir de tu cuenta en este dispositivo.
                        </p>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center justify-center gap-2 bg-rose-600/10 hover:bg-rose-600 border border-rose-500/20 hover:border-rose-600 text-rose-400 hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                    >
                        <LogOut className="w-4 h-4" /> Cerrar Sesión
                    </button>
                </div>

                {/* Eliminar cuenta — abre el modal */}
                <div className="bg-[var(--background)] border border-rose-500/20 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-bold text-[var(--foreground)]">Eliminar Cuenta</p>
                        <p className="text-xs text-[var(--muted)] mt-0.5 max-w-sm">
                            Elimina permanentemente tu cuenta y todos tus datos. No se puede deshacer.
                        </p>
                    </div>
                    <button
                        onClick={() => setDeleteModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-rose-600/10 hover:bg-rose-600 border border-rose-500/20 hover:border-rose-600 text-rose-400 hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                    >
                        <Trash2 className="w-4 h-4" /> Eliminar Cuenta
                    </button>
                </div>
            </div>

            {/* Modal de confirmación de eliminación */}
            <DeleteAccountModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
            />
        </>
    );
};
