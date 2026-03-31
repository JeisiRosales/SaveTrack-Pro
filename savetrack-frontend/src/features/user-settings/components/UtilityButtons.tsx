import { useState, useEffect } from 'react';
import { Download, Share2, Mail, ToolCase } from 'lucide-react';

export const UtilityButtons = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: any) => {
            // Previene que aparezca el mini-infobar en móvil
            e.preventDefault();
            // Guarda el evento para que pueda ser disparado más tarde.
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        // Muestra el prompt de instalación nativo
        deferredPrompt.prompt();
        // Espera a que el usuario responda al prompt
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            // El usuario aceptó la instalación, limpiamos el prompt
            setDeferredPrompt(null);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'SaveTrack Pro',
                    text: '¡Mira esta app para controlar tus finanzas inteligentes!',
                    url: window.location.origin,
                });
            } catch (error: any) {
                // Ignorar el error si el usuario simplemente canceló el diálogo de compartir
                if (error.name !== 'AbortError') {
                    console.error('Error al compartir', error);
                }
            }
        } else {
            alert('La función de compartir no está disponible nativamente en este dispositivo o navegador.');
        }
    };

    const handleContact = () => {
        window.location.href = 'mailto:jeisirosales2003@gmail.com?subject=Soporte%20SaveTrack%20Pro';
    };

    return (
        <div className="bg-[var(--card)] p-6 rounded-3xl border border-[var(--card-border)] shadow-sm">
            <h2 className="text-lg font-bold text-[var(--foreground)] flex gap-2 items-center mb-4">
                <ToolCase className="w-5 h-5 text-indigo-500" /> Utilidades de la App
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Botón de Instalar PWA */}
                {deferredPrompt ? (
                    <button
                        onClick={handleInstallClick}
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 border border-indigo-500/20 transition-all group"
                    >
                        <Download className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold uppercase tracking-wider">Instalar App</span>
                    </button>
                ) : (
                    <div
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-[var(--background)] border border-[var(--card-border)] opacity-60 cursor-not-allowed"
                        title="La app ya está instalada o tu navegador no lo permite"
                    >
                        <Download className="w-6 h-6 text-[var(--muted)]" />
                        <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Instalada</span>
                    </div>
                )}

                {/* Botón de Compartir */}
                <button
                    onClick={handleShare}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 transition-all group"
                >
                    <Share2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-wider">Compartir</span>
                </button>

                {/* Botón de Contacto */}
                <button
                    onClick={handleContact}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 transition-all group"
                >
                    <Mail className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-wider">Contacto</span>
                </button>
            </div>
        </div>
    );
};
