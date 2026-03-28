import React, { useState } from 'react';
import { BookOpen, ChevronDown, Clock, Target, CreditCard, ShieldAlert } from 'lucide-react';

interface ManualSectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

const ManualSection: React.FC<ManualSectionProps> = ({ title, icon, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl overflow-hidden transition-all duration-300">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 hover:bg-[var(--background)] transition-colors text-left"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--background)] rounded-xl border border-[var(--card-border)]">
                        {icon}
                    </div>
                    <h4 className="font-bold text-[var(--foreground)]">{title}</h4>
                </div>
                <ChevronDown className={`w-5 h-5 text-[var(--muted)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[800px] opacity-100 border-t border-[var(--card-border)]' : 'max-h-0 opacity-0'}`}>
                <div className="p-5 text-sm text-[var(--muted)] space-y-4 leading-relaxed">
                    {children}
                </div>
            </div>
        </div>
    );
};

export const UserManual: React.FC = () => {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                    <BookOpen className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-[var(--foreground)]">Centro de Ayuda</h2>
                    <p className="text-xs font-medium text-[var(--muted)]">Guías rápidas para aprovechar al máximo SaveTrack Pro.</p>
                </div>
            </div>

            <div className="space-y-4">
                <ManualSection 
                    title="Gastos Fijos y Pagos Parciales" 
                    icon={<Clock className="w-5 h-5 text-amber-500" />}
                >
                    <p>Los gastos fijos son compromisos recurrentes como Renta, Internet o Servicios. Su lógica funciona de la siguiente manera:</p>
                    <ul className="list-disc pl-5 space-y-2 mt-2 font-medium">
                        <li><strong>Vinculación Automática:</strong> Cuando creas un Gasto Normal y le asignas una categoría marcada como "fija", el sistema detecta que es un abono para tus Gastos Fijos de ese mes.</li>
                        <li><strong>Pagos Parciales:</strong> Si registras un monto inferior a tu proyección, aparecerá como <span className="text-amber-500 font-bold">"Parcial"</span> en tus gastos fijos y la barra te indicará tu progreso.</li>
                        <li><strong>Ajustes de Presupuesto:</strong> Si registras un monto mayor a tu gasto fijo establecido, un aviso de protección validará si deseas actualizar tu presupuesto a la nueva cifra.</li>
                    </ul>
                </ManualSection>

                <ManualSection 
                    title="Cuentas y Transferencias" 
                    icon={<CreditCard className="w-5 h-5 text-emerald-500" />}
                >
                    <p>Las cuentas son los pilares donde guardas tu dinero. Puedes registrar ingresos, realizar gastos o transferir entre ellas.</p>
                    <ul className="list-disc pl-5 space-y-2 mt-2 font-medium">
                        <li><strong>Transferencias Internas:</strong> Las transferencias entre tus cuentas <strong className="text-[var(--foreground)]">no afectan</strong> tus gráficos de ingresos o gastos, ya que tu patrimonio total sigue siendo el mismo. Sirven únicamente para mantener los saldos correctos.</li>
                        <li>Si necesitas registrar la pérdida de capital, asegúrate de marcarlo como un gasto, no como transferencia.</li>
                    </ul>
                </ManualSection>

                <ManualSection 
                    title="Metas de Ahorro" 
                    icon={<Target className="w-5 h-5 text-blue-500" />}
                >
                    <p>Maneja tus adquisiciones más deseadas paso a paso.</p>
                    <ul className="list-disc pl-5 space-y-2 mt-2 font-medium">
                        <li><strong>Aportar Cuentas:</strong> Al aportar saldo a una meta, estás restando capital real disponible en la cuenta seleccionada. El saldo se "mueve" hacia la meta.</li>
                        <li>Al completar una meta, el saldo aportado refleja el costo completado del activo u objetivo adquirido.</li>
                    </ul>
                </ManualSection>

                <ManualSection 
                    title="General y Errores Comunes" 
                    icon={<ShieldAlert className="w-5 h-5 text-rose-500" />}
                >
                    <p>Si alguna vez encuentras desajustes, ten presente estas particularidades:</p>
                    <ul className="list-disc pl-5 space-y-2 mt-2 font-medium">
                        <li>Un gasto no puede exceder el límite monetario que tienes en una cuenta. Si te aparece "Monto no Válido" suele derivar de una cuenta seca.</li>
                        <li>Borrar un Gasto Fijo <strong>no borra</strong> los pagos registrados anteriores de tu historial. Simplemente deshabilita la proyección mensual a futuro.</li>
                    </ul>
                </ManualSection>
            </div>
        </div>
    );
};
