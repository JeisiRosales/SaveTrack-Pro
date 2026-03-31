import { X, History } from 'lucide-react';

interface VersionHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const VERSIONS = [
    {
        version: "v1.1.1",
        date: "Marzo 2026",
        changes: [
            "Integración de Gastos Fijos interactivos en el Dashboard.",
            "Mejora predictiva en selectores de categorías (Fijos vs Variables).",
            "Nuevos botones de utilidades PWA y Compartir.",
            "Refactorización para un código más modular y robusto.",
            "Sistema local de visualización del historial de versiones."
        ]
    },
    {
        version: "v1.1.0",
        date: "Mediados de Marzo 2026",
        changes: [
            "Implementación del sistema completo de Gastos Fijos (Frontend y Backend).",
            "Nuevo Dashboard con gráficas, métricas financieras y seguimiento de flujo de dinero.",
            "Desarrollo del sistema avanzado de Metas de Ahorro y cuotas flexibles.",
            "Integración de transferencias entre cuentas y filtros de transacciones.",
            "Mejoras de arquitectura bajo TypeScript para mayor estabilidad de datos."
        ]
    },
    {
        version: "v1.0.0",
        date: "Enero 2026",
        changes: [
            "Lanzamiento oficial de SaveTrack Pro.",
            "Gestión completa de ingresos, gastos ordinarios y fijos.",
            "Sistema de Metas de ahorro inteligente.",
            "Configuración de período fiscal (semanal, quincenal, mensual).",
            "Temas oscuro/claro personalizados."
        ]
    }
];

export const VersionHistoryModal = ({ isOpen, onClose }: VersionHistoryModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--card)] w-full max-w-md rounded-3xl border border-[var(--card-border)] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[var(--card-border)] bg-[var(--background)]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                            <History className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-[var(--foreground)] leading-none">
                                Historial de Versiones
                            </h2>
                            <p className="text-[10px] text-[var(--muted)] font-medium mt-1">
                                Notas de lanzamiento y actualizaciones
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--background)] border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 relative bg-[var(--card)]">
                    {/* Linea de tiempo vertical */}
                    <div className="absolute left-[31px] top-8 bottom-6 w-px bg-[var(--card-border)]"></div>

                    <div className="space-y-8 relative">
                        {VERSIONS.map((v, i) => (
                            <div key={v.version} className="relative flex gap-4">
                                <div className="mt-1 relative">
                                    <div className={`w-4 h-4 rounded-full border-[3px] border-[var(--card)] ${i === 0 ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-[var(--muted)]'} relative z-10 mx-auto`}></div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <h3 className={`text-sm font-black ${i === 0 ? 'text-indigo-500' : 'text-[var(--foreground)]'}`}>
                                            {v.version}
                                        </h3>
                                        <span className="text-[10px] font-bold text-[var(--muted)] px-1.5 py-0.5 rounded-md bg-[var(--background)] border border-[var(--card-border)]">
                                            {v.date}
                                        </span>
                                        {i === 0 && (
                                            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider ml-auto">
                                                Actual
                                            </span>
                                        )}
                                    </div>
                                    <ul className="space-y-1.5">
                                        {v.changes.map((change, j) => (
                                            <li key={j} className="text-xs text-[var(--muted)] font-medium flex items-start leading-relaxed">
                                                <span className="text-indigo-400 mr-2 mt-[4px] text-[10px]">●</span>
                                                {change}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-[var(--background)] p-4 border-t border-[var(--card-border)] flex justify-center">
                    <p className="text-[10px] text-[var(--muted)] font-bold">
                        SaveTrack Pro &copy; {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </div>
    );
};
