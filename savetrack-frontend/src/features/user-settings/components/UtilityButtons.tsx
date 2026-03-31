import { useState, useEffect } from 'react';
import { Download, Share2, Mail, ToolCase, X, Smartphone, Monitor, Upload } from 'lucide-react';

// Modal de instrucciones de instalación
const InstallInstructionsModal = ({ isOpen, onClose, isIOS }: { isOpen: boolean; onClose: () => void; isIOS: boolean }) => {
    if (!isOpen) return null;

    const iosSteps = [
        { icon: <Upload className="w-4 h-4" />, text: "Toca el ícono de Compartir en la barra inferior de Safari" },
        { icon: <Download className="w-4 h-4" />, text: 'Desplázate y selecciona "Agregar a pantalla de inicio"' },
        { icon: <Smartphone className="w-4 h-4" />, text: "Confirma tocando \"Agregar\" en la esquina superior derecha" },
    ];

    const genericSteps = [
        { icon: <Monitor className="w-4 h-4" />, text: 'Abre el menú de tu navegador (los tres puntos ⋮)' },
        { icon: <Download className="w-4 h-4" />, text: 'Busca "Instalar aplicación" o "Agregar a pantalla de inicio"' },
        { icon: <Smartphone className="w-4 h-4" />, text: "Confirma la instalación cuando se te solicite" },
    ];

    const steps = isIOS ? iosSteps : genericSteps;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={onClose}
            />
            <div className="relative bg-[var(--card)] w-full max-w-sm rounded-[2rem] p-6 border border-[var(--card-border)] shadow-2xl overflow-hidden"
                style={{ animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>

                {/* Decoración de fondo */}
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-500/15 blur-3xl rounded-full pointer-events-none" />

                {/* Botón cerrar */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 text-[var(--muted)] hover:bg-[var(--background)] rounded-full transition-colors z-10"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="relative z-10">
                    {/* Ícono + título */}
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Download className="w-6 h-6 text-indigo-500" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-[var(--foreground)]">Instalar SaveTrack Pro</h3>
                            <p className="text-xs text-[var(--muted)] font-medium">
                                {isIOS ? 'Instrucciones para iOS (Safari)' : 'Instrucciones para tu navegador'}
                            </p>
                        </div>
                    </div>

                    {/* Pasos */}
                    <div className="space-y-3 mb-6">
                        {steps.map((step, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-[var(--background)] rounded-2xl border border-[var(--card-border)]">
                                <div className="w-7 h-7 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 flex-shrink-0 mt-0.5">
                                    {step.icon}
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-xs font-black text-indigo-500 mt-0.5">{index + 1}.</span>
                                    <p className="text-xs text-[var(--foreground)] font-medium leading-relaxed">{step.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Botón cerrar */}
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] text-sm"
                    >
                        ¡Entendido!
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0)   scale(1); }
                }
            `}</style>
        </div>
    );
};

export const UtilityButtons = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showInstallModal, setShowInstallModal] = useState(false);

    useEffect(() => {
        const checkStandalone = () => {
            const isStandAloneMatch = window.matchMedia('(display-mode: standalone)').matches;
            const isIOSStandalone = (window.navigator as any).standalone === true;
            setIsStandalone(isStandAloneMatch || isIOSStandalone);
        };

        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIOSDevice);

        checkStandalone();

        const handleBeforeInstallPrompt = (e: any) => {
            // Previene que aparezca el mini-infobar en móvil
            e.preventDefault();
            // Guarda el evento para que pueda ser disparado más tarde.
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.matchMedia('(display-mode: standalone)').addEventListener('change', checkStandalone);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkStandalone);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            // Muestra el prompt de instalación nativo
            deferredPrompt.prompt();
            // Espera a que el usuario responda al prompt
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                // El usuario aceptó la instalación, limpiamos el prompt
                setDeferredPrompt(null);
            }
        } else {
            setShowInstallModal(true);
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
        <>
            <InstallInstructionsModal
                isOpen={showInstallModal}
                onClose={() => setShowInstallModal(false)}
                isIOS={isIOS}
            />
            <div className="bg-[var(--card)] p-6 rounded-3xl border border-[var(--card-border)] shadow-sm">
                <h2 className="text-lg font-bold text-[var(--foreground)] flex gap-2 items-center mb-4">
                    <ToolCase className="w-5 h-5 text-indigo-500" /> Utilidades de la App
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Botón de Instalar PWA */}
                    {isStandalone ? (
                        <div
                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-[var(--background)] border border-[var(--card-border)] opacity-60 cursor-not-allowed"
                            title="La app ya está instalada."
                        >
                            <Download className="w-6 h-6 text-[var(--muted)]" />
                            <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Instalada</span>
                        </div>
                    ) : (
                        <button
                            onClick={handleInstallClick}
                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 border border-indigo-500/20 transition-all group"
                        >
                            <Download className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold uppercase tracking-wider">Instalar App</span>
                        </button>
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
        </>
    );
};
