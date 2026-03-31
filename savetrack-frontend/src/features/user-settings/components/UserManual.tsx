import React, { useState } from 'react';
import { BookOpen, FileQuestionMark, ChevronDown, Clock, Target, CreditCard, ShieldAlert, LayoutDashboard, TrendingUp, Tags, List } from 'lucide-react';

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
            <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100 border-t border-[var(--card-border)]' : 'max-h-0 opacity-0'}`}>
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
                {/* Dashboard */}
                <ManualSection
                    title="Dashboard (Panel Principal)"
                    icon={<LayoutDashboard className="w-5 h-5 text-indigo-500" />}
                >
                    <p>Es la vista global y el centro de control de tu economía. Aquí podrás observar tu balance total unificado.</p>
                    <ul className="list-disc pl-5 space-y-2 mt-2 font-medium">
                        <li><strong>Unificación Multimoneda:</strong> La tarjeta principal refleja tu balance global calculando automáticamente el valor de tus cuentas en Bs y USD según la tasa del BCV del día.</li>
                        <li><strong>Métricas del Mes:</strong> Visualiza cuánto has ingresado y gastado durante el mes en curso para ajustar tus hábitos.</li>
                        <li><strong>Progreso de Gastos Fijos:</strong> Muestra qué porcentaje de tus compromisos mensuales has completado.</li>
                    </ul>
                </ManualSection>

                {/* Cuentas y Transferencias */}
                <ManualSection
                    title="Cuentas y Transferencias"
                    icon={<CreditCard className="w-5 h-5 text-emerald-500" />}
                >
                    <p>Las cuentas son los pilares donde guardas tu dinero.</p>
                    <ul className="list-disc pl-5 space-y-2 mt-2 font-medium">
                        <li><strong>Cuentas:</strong> Puedes ver tus activos disponibles</li>
                        <li><strong>Transferencias:</strong> Puedes transferir dinero entre tus cuentas</li>
                        <li><strong>Control de Saldo:</strong> Las cuentas te permiten tener un control de tu dinero.</li>
                    </ul>
                </ManualSection>

                {/* Ingresos y Gastos */}
                <ManualSection
                    title="Ingresos y Gastos"
                    icon={<TrendingUp className="w-5 h-5 text-violet-500" />}
                >
                    <p>A través de estos módulos alimentas la base de datos y tus gráficos de comportamiento.</p>
                    <ul className="list-disc pl-5 space-y-2 mt-2 font-medium">
                        <li><strong>Ingresos:</strong> Cuando registras un ingreso, inyectas capital puro a una cuenta determinada (ej. cobro de salario), aumentando tu balance global.</li>
                        <li><strong>Gastos:</strong> Los gastos deducen dinero de una cuenta y deben estar obligatoriamente categorizados para poder alimentar los gráficos del Dashboard.</li>
                    </ul>
                </ManualSection>

                {/* Gastos Fijos */}
                <ManualSection
                    title="Gastos Fijos y Pagos Parciales"
                    icon={<Clock className="w-5 h-5 text-amber-500" />}
                >
                    <p>Los gastos fijos son compromisos recurrentes como Renta, Internet o Servicios.</p>
                    <ul className="list-disc pl-5 space-y-2 mt-2 font-medium">
                        <li><strong>Vinculación Automática:</strong> Cuando creas un Gasto Normal y lo asignas a una categoría marcada como "fija", el sistema detecta de forma autónoma que es un abono a tus Gastos Fijos.</li>
                        <li><strong>Pagos Parciales:</strong> Si registras un monto inferior a tu proyección, aparecerá como <span className="text-amber-500 font-bold">"Parcial"</span> en tus gastos fijos.</li>
                        <li><strong>Detección de Aumento:</strong> Si registras un monto superior a tu proyección, el sistema lo detectará y te mostrará una alerta para que ajustes tu gasto fijo.</li>
                    </ul>
                </ManualSection>

                {/* Categorías */}
                <ManualSection
                    title="Categorías y Etiquetas"
                    icon={<Tags className="w-5 h-5 text-fuchsia-500" />}
                >
                    <p>Las categorías sirven para organizar visualmente en qué estás gastando y dar orden a tu economía.</p>
                    <ul className="list-disc pl-5 space-y-2 mt-2 font-medium">
                        <li><strong>Categoría Normal:</strong> Ideal para cosas esporádicas como "Comida rápida" o "Transporte".</li>
                        <li><strong>Marcar como Gasto Fijo:</strong> Si una categoría se marca como Gasto Fijo, se habilita el recordatorio de proyección mensual. Todo gasto a esta categoría afectará la barra de compromisos del Dashboard.</li>
                    </ul>
                </ManualSection>

                {/* Metas */}
                <ManualSection
                    title="Metas de Ahorro"
                    icon={<Target className="w-5 h-5 text-blue-500" />}
                >
                    <p>Maneja tus adquisiciones más deseadas (ej. Auto, Teléfono) paso a paso.</p>
                    <ul className="list-disc pl-5 space-y-2 mt-2 font-medium">
                        <li><strong>Aportar Cuentas:</strong> Al aportar saldo a una meta, estás restando capital real disponible en la cuenta seleccionada. El saldo se reserva para ese objetivo.</li>
                        <li>Al completar una meta, el saldo aportado refleja el costo ya pagado del activo adquirido.</li>
                    </ul>
                </ManualSection>

                {/* Transacciones */}
                <ManualSection
                    title="Historial de Transacciones"
                    icon={<List className="w-5 h-5 text-cyan-500" />}
                >
                    <p>El libro de registro inmutable de tus finanzas.</p>
                    <ul className="list-disc pl-5 space-y-2 mt-2 font-medium">
                        <li><strong>Registro Integral:</strong> Aquí se lista cada centavo que entra, sale o se transfiere.</li>
                        <li><strong>Reversión de Errores:</strong> Si te equivocas en un ingreso o gasto, es desde esta vista donde debes eliminar el registro. Al borrarlo, el saldo volverá a tu cuenta origen y se reestablecerán las deducciones.</li>
                    </ul>
                </ManualSection>

                {/* FAQs Divisor */}
                <div className="flex items-center gap-3 mt-6 mb-6">
                    <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                        <FileQuestionMark className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-[var(--foreground)]">Preguntas Frecuentes</h2>
                        <p className="text-xs font-medium text-[var(--muted)]">Soluciones rápidas a dudas comunes sobre el funcionamiento de SaveTrack.</p>
                    </div>
                </div>

                {/* FAQ 1 */}
                <ManualSection
                    title="¿Qué pasa si elimino una cuenta con saldo?"
                    icon={<ShieldAlert className="w-5 h-5 text-zinc-500" />}
                >
                    <p className="font-semibold mb-2">Respuesta:</p>
                    <p>El sistema te advierte antes de hacerlo, pero si confirmas la eliminación, su capital se descontará del balance global. Se aconseja transferir los fondos a otra cuenta o registrar un gasto de ajuste antes de borrarla por completo. El historial asociado a esa cuenta (los movimientos pasados) se mantiene por auditoría.</p>
                </ManualSection>

                {/* FAQ 2 */}
                <ManualSection
                    title="¿Puedo cambiar la moneda de la aplicación?"
                    icon={<ShieldAlert className="w-5 h-5 text-zinc-500" />}
                >
                    <p className="font-semibold mb-2">Respuesta:</p>
                    <p>Sí. En el panel de Ajustes Globales, puedes alternar entre USD y VES en cualquier momento. Sin embargo, ten en cuenta que el sistema tomará tus saldos e historial reales y los mostrará tal cual, no realizará conversiones automáticas.</p>
                </ManualSection>

                {/* FAQ 3 */}
                <ManualSection
                    title='¿Por qué el sistema me arroja "Monto no Válido"?'
                    icon={<ShieldAlert className="w-5 h-5 text-zinc-500" />}
                >
                    <p className="font-semibold mb-2">Respuesta:</p>
                    <p>SaveTrack prohíbe balances contables en negativo por salud financiera. Si intentas registrar un gasto de $50 seleccionando una "Cuenta Efectivo" que solo tiene $20, el sistema bloqueará la transacción. Para solventarlo, debes realizar un Ingreso previo a esa cuenta para fondearla.</p>
                </ManualSection>

                {/* FAQ 4 */}
                <ManualSection
                    title="¿El dinero se debita solo en los Gastos Fijos?"
                    icon={<ShieldAlert className="w-5 h-5 text-zinc-500" />}
                >
                    <p className="font-semibold mb-2">Respuesta:</p>
                    <p>NO. SaveTrack no tiene conexión bancaria y actúa como un planificador personal. Te notificará la existencia e inminencia de un Pago Fijo (como el internet), pero tú deberás registrar "manualmente" un Gasto a esa categoría cuando lo pagues en la vida real.</p>
                </ManualSection>

            </div>
        </div>
    );
};
