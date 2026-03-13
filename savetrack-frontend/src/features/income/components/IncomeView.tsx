import React, { useState } from 'react';
import { TrendingUp, Menu, Briefcase, Calendar, Trash2, Loader2 } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { TimeRange } from '../hooks/UseIncomeData';

const CATEGORY_COLORS = ['#2dd4bf', '#a3e635', '#fb923c', '#818cf8', '#f472b6', '#34d399'];

interface IncomesViewProps {
    data: {
        totalMonthlyIncome: number;
        averageWeeklyIncome: number;
        currencySymbol: string;
        formattedTransactions: any[];
        dailyChartData: { day: number; total: number }[];
        categoryChartData: { name: string; value: number; percentage: number }[];
        timeRange: TimeRange;
        setTimeRange: (r: TimeRange) => void;
    };
    onOpenModal: () => void;
    onToggleSidebar: () => void;
    onRemove: (id: string) => Promise<unknown>;
    isRemoving: boolean;
    removingId: string | undefined;
    onConfirmingChange?: (confirming: boolean) => void;
}

// Fila de ingreso con eliminar
interface IncomeRowProps {
    tx: any;
    symbol: string;
    onRemove: (id: string) => Promise<unknown>;
    isThisRemoving: boolean;
    isConfirming: boolean;
    onConfirmChange: (id: string | null) => void;
}

const IncomeRow: React.FC<IncomeRowProps> = ({ tx, symbol, onRemove, isThisRemoving, isConfirming, onConfirmChange }) => {
    const date = new Date(tx.created_at);
    const dateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

    return (
        <div className={`flex items-center gap-3 px-4 py-3 border-b border-[var(--card-border)] last:border-0 transition-colors ${isThisRemoving ? 'opacity-40 pointer-events-none' : 'hover:bg-[var(--background)]/50'
            }`}>
            {!isConfirming ? (
                <button
                    onClick={() => onConfirmChange(tx.id)}
                    className="ml-1 p-1.5 rounded-lg text-[var(--muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-all flex-shrink-0"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            ) : (
                <div className="ml-1 flex items-center gap-1 flex-shrink-0">
                    <button
                        onClick={() => onRemove(tx.id)}
                        className="text-[10px] font-black px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
                    >
                        {isThisRemoving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Sí'}
                    </button>
                    <button
                        onClick={() => onConfirmChange(null)}
                        className="text-[10px] font-black px-2 py-1 bg-[var(--background)] border border-[var(--card-border)] text-[var(--muted)] rounded-lg hover:text-[var(--foreground)] transition-colors"
                    >
                        No
                    </button>
                </div>
            )}
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--foreground)] truncate">{tx.entityName}</p>
                <p className="text-[10px] text-[var(--muted)] font-medium">{tx.categoryName} · {dateStr}</p>
            </div>
            <p className="text-sm font-black text-emerald-400 flex-shrink-0">
                +{symbol}{Number(tx.amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
        </div>
    );
};

// Botón de filtro rápido
const QuickFilterBtn = ({ label, onClick, active }: { label: string; onClick: () => void; active: boolean }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all border ${active
            ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm shadow-emerald-500/20'
            : 'bg-[var(--card)] border-[var(--card-border)] text-[var(--muted)] hover:border-emerald-500/50 hover:text-[var(--foreground)]'
            }`}
    >
        {label}
    </button>
);

// Tooltips
const AreaTooltip = ({ active, payload, symbol }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl px-3 py-2 text-xs shadow-lg">
            <p className="text-gray-400 font-bold mb-0.5">{payload[0]?.payload?.day}/{payload[0]?.payload?.month}</p>
            <p className="text-emerald-400 font-black text-sm">
                {symbol}{Number(payload[0]?.value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
        </div>
    );
};

const DonutTooltip = ({ active, payload, symbol }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl px-3 py-2 text-xs shadow-lg">
            <p className="text-[var(--foreground)] font-bold">{payload[0]?.name}</p>
            <p className="text-[var(--muted)]">
                {symbol}{Number(payload[0]?.value ?? 0).toLocaleString()} · {payload[0]?.payload?.percentage}%
            </p>
        </div>
    );
};

// Vista principal
export const IncomesView: React.FC<IncomesViewProps> = ({
    data, onToggleSidebar, onRemove, removingId, onConfirmingChange,
}) => {
    const [activeDonutIndex, setActiveDonutIndex] = useState<number | null>(null);
    const [confirmingId, setConfirmingId] = useState<string | null>(null);

    const handleConfirmChange = (id: string | null) => {
        setConfirmingId(id);
        onConfirmingChange?.(id !== null);
    };

    const {
        totalMonthlyIncome, averageWeeklyIncome, currencySymbol,
        formattedTransactions, dailyChartData, categoryChartData,
        timeRange, setTimeRange,
    } = data;

    const fmt = (n: number) =>
        `${currencySymbol}${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

    const periodLabel: Record<TimeRange, string> = {
        today: 'Hoy', yesterday: 'Ayer', week: 'Esta semana', biweekly: 'Quincenal',
        month: 'Este mes', last_month: 'Mes anterior', year: 'Este año', all: 'Todo',
    };

    return (
        <main className="flex-1 p-6 pb-30 lg:p-10 relative overflow-x-hidden font-black">

            {/* Header */}
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-emerald-500" />
                        Mis Ingresos
                    </h1>
                    <p className="text-[var(--muted)] text-xs mt-1 font-medium">
                        Controla y monitorea tus fuentes de entrada este mes.
                    </p>
                </div>
                <button
                    onClick={onToggleSidebar}
                    className="lg:hidden p-2.5 bg-[var(--card)] border border-[var(--card-border)] rounded-xl"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </header>

            {/* Filtros rápidos */}
            <div className="mb-6 overflow-x-auto">
                <div className="flex items-center gap-2 pb-2">
                    <div className="flex items-center gap-2 pr-4 border-r border-[var(--card-border)] mr-2 flex-shrink-0">
                        <Calendar className="w-4 h-4 text-[var(--muted)]" />
                        <span className="text-[10px] font-bold text-[var(--muted)] uppercase">Periodo:</span>
                    </div>
                    <QuickFilterBtn label="Todo" onClick={() => setTimeRange('all')} active={timeRange === 'all'} />
                    <QuickFilterBtn label="Hoy" onClick={() => setTimeRange('today')} active={timeRange === 'today'} />
                    <QuickFilterBtn label="Ayer" onClick={() => setTimeRange('yesterday')} active={timeRange === 'yesterday'} />
                    <QuickFilterBtn label="Esta Semana" onClick={() => setTimeRange('week')} active={timeRange === 'week'} />
                    <QuickFilterBtn label="Quincenal" onClick={() => setTimeRange('biweekly')} active={timeRange === 'biweekly'} />
                    <QuickFilterBtn label="Este Mes" onClick={() => setTimeRange('month')} active={timeRange === 'month'} />
                    <QuickFilterBtn label="Mes Anterior" onClick={() => setTimeRange('last_month')} active={timeRange === 'last_month'} />
                    <QuickFilterBtn label="Este Año" onClick={() => setTimeRange('year')} active={timeRange === 'year'} />
                </div>
            </div>

            <div className="space-y-6">

                {/* Tarjeta combinada */}
                <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-lime-400/5 rounded-tr-full -z-10" />

                    <div className="flex items-center gap-2 mb-4">
                        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">
                            Resumen —
                        </p>
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                            {periodLabel[timeRange]}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
                        <div>
                            <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">
                                Ingreso Total
                            </p>
                            <p className="text-3xl font-black text-emerald-500 leading-none">
                                {fmt(totalMonthlyIncome)}
                            </p>
                            <p className="text-[10px] text-[var(--muted)] mt-1.5 font-medium">
                                Acumulado en el período seleccionado
                            </p>
                        </div>

                        <div className="hidden sm:block absolute left-1/2 top-0 bottom-0 w-px bg-[var(--card-border)]" />

                        <div>
                            <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">
                                Promedio Semanal
                            </p>
                            <p className="text-3xl font-black text-[var(--foreground)] leading-none">
                                {fmt(averageWeeklyIncome)}
                            </p>
                            <p className="text-[10px] text-[var(--muted)] mt-1.5 font-medium">
                                Basado en {fmt(totalMonthlyIncome)} ÷ 4 sem
                            </p>
                        </div>
                    </div>
                </div>

                {/* Gráficas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Área */}
                    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-[var(--foreground)] mb-1">Ingreso — {periodLabel[timeRange]}</h3>
                        <p className="text-[var(--muted)] text-[10px] font-medium mb-5">Ingreso por día en el período</p>

                        {dailyChartData.length === 0 ? (
                            <EmptyChart message="Sin datos en este período" />
                        ) : (
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={dailyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="label" tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                                    <YAxis
                                        tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 600 }}
                                        axisLine={false} tickLine={false}
                                        tickFormatter={v => v >= 1000 ? `${currencySymbol}${(v / 1000).toFixed(1)}k` : `${currencySymbol}${v}`}
                                    />
                                    <Tooltip content={<AreaTooltip symbol={currencySymbol} />} cursor={{ stroke: 'var(--card-border)', strokeWidth: 1 }} />
                                    <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2.5} fill="url(#incomeGradient)" dot={false} activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Dona */}
                    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-[var(--foreground)] mb-1">Ingresos por Categoría</h3>
                        <p className="text-[var(--muted)] text-[10px] font-medium mb-4">Distribución — {periodLabel[timeRange]}</p>

                        {categoryChartData.length === 0 ? (
                            <EmptyChart message="Sin categorías en este período" />
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie
                                            data={categoryChartData} cx="50%" cy="50%"
                                            innerRadius={55} outerRadius={85}
                                            paddingAngle={categoryChartData.length > 1 ? 3 : 0}
                                            dataKey="value" strokeWidth={0}
                                            onMouseEnter={(_, idx) => setActiveDonutIndex(idx)}
                                            onMouseLeave={() => setActiveDonutIndex(null)}
                                        >
                                            {categoryChartData.map((entry, idx) => (
                                                <Cell
                                                    key={entry.name}
                                                    fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]}
                                                    opacity={activeDonutIndex === null || activeDonutIndex === idx ? 1 : 0.4}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<DonutTooltip symbol={currencySymbol} />} />
                                    </PieChart>
                                </ResponsiveContainer>

                                <ul className="mt-3 space-y-2">
                                    {categoryChartData.map((cat, idx) => (
                                        <li key={cat.name} className="flex items-center justify-between text-xs">
                                            <span className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }} />
                                                <span className="flex items-center gap-1.5 text-[var(--foreground)] font-semibold">
                                                    <Briefcase className="w-3 h-3 opacity-60" />
                                                    {cat.name}
                                                </span>
                                            </span>
                                            <span className="text-[var(--muted)] font-bold">
                                                {fmt(cat.value)}{' '}
                                                <span className="text-[var(--muted)]/60">({cat.percentage}%)</span>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                </div>

                {/* Tabla */}
                <div className="bg-[var(--card)] rounded-2xl border border-[var(--card-border)] overflow-hidden">
                    <div className="p-6 border-b border-[var(--card-border)] flex justify-between items-center bg-[var(--background)]/50">
                        <div>
                            <h3 className="text-sm font-bold text-[var(--foreground)]">Últimos Ingresos</h3>
                            <p className="text-[10px] text-[var(--muted)] mt-0.5 font-medium">
                                {formattedTransactions.length} registro{formattedTransactions.length !== 1 ? 's' : ''} · {periodLabel[timeRange]}
                            </p>
                        </div>
                    </div>
                    <div className="divide-y divide-[var(--card-border)]">
                        {formattedTransactions.length === 0 ? (
                            <div className="p-10 text-center text-[var(--muted)] text-sm font-medium">
                                No hay ingresos en este período.
                            </div>
                        ) : (
                            formattedTransactions.map(tx => (
                                <IncomeRow
                                    key={tx.id}
                                    tx={tx}
                                    symbol={currencySymbol}
                                    onRemove={onRemove}
                                    isThisRemoving={removingId === tx.id}
                                    isConfirming={confirmingId === tx.id}
                                    onConfirmChange={handleConfirmChange}
                                />
                            ))
                        )}
                    </div>
                </div>

            </div>
        </main>
    );
};

const EmptyChart = ({ message }: { message: string }) => (
    <div className="h-[220px] flex flex-col items-center justify-center gap-2">
        <div className="w-10 h-10 rounded-full bg-[var(--card-border)] flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[var(--muted)]" />
        </div>
        <p className="text-[var(--muted)] text-xs font-medium text-center">{message}</p>
    </div>
);