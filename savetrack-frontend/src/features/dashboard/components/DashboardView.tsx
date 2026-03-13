import React from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import {
    Menu, Loader2, TrendingUp, TrendingDown, Wallet,
    Target, ArrowUpRight, ArrowDownRight,
    Landmark, RefreshCw, PiggyBank, ChevronRight,
    BarChart3,
    User,
    Settings
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { useGlobalSettings } from '@/context/SettingsContext';
import { useDashboard } from '../hooks/useDashboard';

interface ContextType { toggleSidebar: () => void; }

// Tooltip del gráfico
const ChartTooltip = ({ active, payload, label, symbol }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl px-3 py-2 text-xs shadow-lg">
            <p className="text-[var(--muted)] font-bold mb-1">{label}</p>
            {payload.map((p: any) => (
                <p key={p.name} style={{ color: p.fill }} className="font-black">
                    {p.name === 'income' ? '▲' : '▼'} {symbol}{Number(p.value).toLocaleString()}
                </p>
            ))}
        </div>
    );
};

// Botón de acción rápida
const QuickAction = ({ icon: Icon, label, to, color, onClick }: any) => {
    const navigate = useNavigate();
    const handleClick = () => { onClick?.(); if (to) navigate(to); };
    return (
        <button
            onClick={handleClick}
            className="flex flex-col items-center gap-2 group"
        >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-active:scale-95 shadow-sm ${color}`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-bold text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors whitespace-nowrap">
                {label}
            </span>
        </button>
    );
};

// Fila de actividad reciente 
const ActivityRow = ({ item, symbol }: any) => {
    const isIncome = item.universalType === 'income';
    const isGoal = item.universalType === 'deposit' || item.universalType === 'withdrawal';
    const color = isIncome ? 'text-emerald-500' : isGoal ? 'text-indigo-400' : 'text-rose-500';
    const bgColor = isIncome ? 'bg-emerald-500/10' : isGoal ? 'bg-indigo-500/10' : 'bg-rose-500/10';
    const IconComp = isIncome ? TrendingUp : isGoal ? Target : TrendingDown;
    const sign = isIncome ? '+' : '-';

    const date = new Date(item.created_at);
    const dateStr = `${date.getDate()}/${date.getMonth() + 1}`;

    return (
        <div className="flex items-center gap-3 py-3 px-4 hover:bg-[var(--background)]/50 transition-colors rounded-xl group">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${bgColor}`}>
                <IconComp className={`w-4 h-4 ${color}`} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--foreground)] truncate">{item.entityName}</p>
                <p className="text-[10px] text-[var(--muted)] font-medium">{dateStr}</p>
            </div>
            <p className={`text-sm font-black flex-shrink-0 ${color}`}>
                {sign}{symbol}{Number(item.amount).toLocaleString()}
            </p>
        </div>
    );
};

// Vista principal 
export const DashboardView: React.FC = () => {
    const { user } = useAuth();
    const { currencySymbol, periodUnitLabel } = useGlobalSettings();
    // Capitalizar primera letra para títulos de métricas (ej: "Semana", "Mes")
    const periodUnitCap = periodUnitLabel.charAt(0).toUpperCase() + periodUnitLabel.slice(1);
    const { toggleSidebar } = useOutletContext<ContextType>();

    const {
        loading, error,
        accounts, goals, recentActivity,
        totalBalance, totalSavedInGoals,
        monthlyIncome, monthlyExpense, monthlySavings, savingsRate,
        weeklyData, refresh,
    } = useDashboard();

    const fmt = (n: number) =>
        `${currencySymbol}${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-[var(--background)]">
            <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
        </div>
    );

    return (
        <main className="flex-1 p-5 lg:p-8 relative overflow-x-hidden">

            {/* Header  */}
            <header className="mb-7 flex justify-between items-center">
                <div>
                    <p className="text-[var(--muted)] text-xs font-bold mb-0.5">
                        {greeting}
                    </p>
                    <h1 className="text-xl lg:text-2xl font-bold flex items-center gap-2">
                        <User className="w-6 h-6 text-[var(--accent-text)]" />
                        Hola, <span className="text-[var(--accent-text)]">{user?.full_name?.split(' ')[0] || 'Usuario'}</span>
                    </h1>
                    <p className="text-[var(--muted)] text-xs mt-0.5 font-medium">
                        Aquí tienes tu resumen financiero.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => refresh()}
                        className="p-2.5 bg-[var(--card)] border border-[var(--card-border)] rounded-xl hover:bg-[var(--background)] transition-colors"
                    >
                        <RefreshCw className="w-4 h-4 text-[var(--muted)]" />
                    </button>
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-2.5 bg-[var(--card)] border border-[var(--card-border)] rounded-xl"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {error ? (
                <div className="p-6 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 text-center font-medium">
                    {error}
                </div>
            ) : (
                <div className="space-y-6 max-w-[1280px]">

                    {/* Balance hero + acciones rápidas */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                        {/* Balance principal */}
                        <div className="lg:col-span-2 bg-[#4F46E5] rounded-2xl p-7 relative overflow-hidden">

                            {/* Decoración sutil */}
                            <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none" />
                            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />

                            {/* Cabecera */}
                            <div className="flex items-start justify-between mb-6 relative">
                                <div>
                                    <p className="text-[10px] font-black text-white uppercase mb-1">
                                        Balance Total
                                    </p>
                                    <h2 className="text-4xl lg:text-5xl font-black text-white leading-none">
                                        {fmt(totalBalance + totalSavedInGoals)}
                                    </h2>
                                    <p className="text-white/60 text-xs font-medium mt-2">
                                        Distribuido en {accounts.length} cuenta{accounts.length !== 1 ? 's' : ''} + tus metas de ahorro
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
                                    <Wallet className="w-5 h-5 text-white" />
                                </div>
                            </div>

                            {/* Separador */}
                            <div className="h-px bg-white/10 mb-5" />

                            {/* Mini cuentas */}
                            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide relative">
                                {accounts.map(acc => {
                                    const pct = totalBalance > 0 ? Math.round((acc.balance / totalBalance) * 100) : 0;
                                    return (
                                        <Link
                                            key={acc.id}
                                            to="/accounts"
                                            className="flex-1 min-w-[130px] bg-white/10 hover:bg-white/30 border border-white/10 hover:border-white/25 rounded-xl px-4 py-3 transition-all"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-[10px] font-black text-white uppercase truncate">
                                                    {acc.name}
                                                </p>
                                                <span className="text-[10px] font-bold text-white/80 flex-shrink-0 ml-1">
                                                    {pct}%
                                                </span>
                                            </div>
                                            <p className="text-sm font-black text-white">
                                                {fmt(acc.balance)}
                                            </p>
                                            {/* Barra de proporción */}
                                            <div className="mt-2 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-white/80 rounded-full transition-all duration-500"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Acciones rápidas */}
                        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-6 flex flex-col justify-between">
                            <div>
                                <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-4">
                                    Acciones Rápidas
                                </p>
                                <div className="grid grid-cols-3 gap-y-5 gap-x-2">
                                    <QuickAction icon={TrendingUp} label="Ingreso" to="/incomes" color="bg-emerald-600" />
                                    <QuickAction icon={TrendingDown} label="Gasto" to="/expenses" color="bg-rose-600" />
                                    <QuickAction icon={PiggyBank} label="Meta" to="/goals" color="bg-indigo-600" />
                                    <QuickAction icon={Landmark} label="Cuentas" to="/accounts" color="bg-sky-600" />
                                    <QuickAction icon={BarChart3} label="Movimientos" to="/transactions" color="bg-violet-600" />
                                    <QuickAction icon={Settings} label="Ajustes" to="/settings" color="bg-amber-600" />
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-[var(--card-border)] flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-[var(--muted)] uppercase">Ahorro en metas</p>
                                    <p className="text-lg font-black text-indigo-400">{fmt(totalSavedInGoals)}</p>
                                </div>
                                <PiggyBank className="w-8 h-8 text-indigo-400/30" />
                            </div>
                        </div>
                    </div>

                    {/* Métricas del mes */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            {
                                label: `Ingresos por ${periodUnitCap}`,
                                value: fmt(monthlyIncome),
                                sub: 'Entradas registradas',
                                icon: ArrowUpRight,
                                color: 'text-emerald-500',
                                bg: 'bg-emerald-500/10',
                            },
                            {
                                label: `Gastos por ${periodUnitCap}`,
                                value: fmt(monthlyExpense),
                                sub: 'Salidas registradas',
                                icon: ArrowDownRight,
                                color: 'text-rose-500',
                                bg: 'bg-rose-500/10',
                            },
                            {
                                label: 'Balance Neto',
                                value: fmt(monthlySavings),
                                sub: 'Ingresos − Gastos',
                                icon: Wallet,
                                color: monthlySavings >= 0 ? 'text-indigo-400' : 'text-rose-500',
                                bg: monthlySavings >= 0 ? 'bg-indigo-500/10' : 'bg-rose-500/10',
                            },
                            {
                                label: 'Tasa de Ahorro',
                                value: `${savingsRate}%`,
                                sub: `Del ingreso por ${periodUnitLabel}`,
                                icon: PiggyBank,
                                color: savingsRate >= 20 ? 'text-emerald-500' : savingsRate >= 10 ? 'text-amber-400' : 'text-rose-500',
                                bg: savingsRate >= 20 ? 'bg-emerald-500/10' : savingsRate >= 10 ? 'bg-amber-500/10' : 'bg-rose-500/10',
                            },
                        ].map(m => (
                            <div key={m.label} className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-5 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                                <div className="flex items-start justify-between mb-3">
                                    <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-wider leading-tight">
                                        {m.label}
                                    </p>
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${m.bg}`}>
                                        <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
                                    </div>
                                </div>
                                <p className={`text-2xl font-black ${m.color} leading-none mb-1`}>{m.value}</p>
                                <p className="text-[10px] text-[var(--muted)] font-medium">{m.sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* Gráfica semanal + Actividad reciente */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

                        {/* Gráfica de barras semanal */}
                        <div className="lg:col-span-3 bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-sm font-bold text-[var(--foreground)]">
                                    Flujo Semanal
                                </h3>
                                <Link to="/transactions" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5">
                                    Ver todo <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>
                            <p className="text-[var(--muted)] text-[10px] font-medium mb-5">
                                Ingresos vs Gastos — últimas 6 semanas
                            </p>

                            {weeklyData.every(w => w.income === 0 && w.expense === 0) ? (
                                <div className="h-[200px] flex flex-col items-center justify-center gap-2">
                                    <BarChart3 className="w-8 h-8 text-[var(--muted)]/30" />
                                    <p className="text-[var(--muted)] text-xs">Sin datos suficientes</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={weeklyData} barGap={4} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                        <XAxis dataKey="label" tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false}
                                            tickFormatter={v => v >= 1000 ? `${currencySymbol}${(v / 1000).toFixed(0)}k` : `${currencySymbol}${v}`}
                                        />
                                        <Tooltip content={<ChartTooltip symbol={currencySymbol} />} cursor={{ fill: 'var(--background)', radius: 4 }} />
                                        <Bar dataKey="income" name="income" radius={[4, 4, 0, 0]} maxBarSize={22} fill="#10b981" />
                                        <Bar dataKey="expense" name="expense" radius={[4, 4, 0, 0]} maxBarSize={22} fill="#f87171" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}

                            {/* Leyenda */}
                            <div className="flex gap-4 mt-3">
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--muted)]">
                                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Ingresos
                                </span>
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--muted)]">
                                    <span className="w-2.5 h-2.5 rounded-sm bg-rose-400" /> Gastos
                                </span>
                            </div>
                        </div>

                        {/* Actividad reciente */}
                        <div className="lg:col-span-2 bg-[var(--card)] border border-[var(--card-border)] rounded-2xl overflow-hidden">
                            <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-[var(--card-border)]">
                                <div>
                                    <h3 className="text-sm font-bold text-[var(--foreground)]">Actividad</h3>
                                    <p className="text-[10px] text-[var(--muted)] font-medium">Últimos movimientos</p>
                                </div>
                                <Link to="/transactions" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5">
                                    Ver todo <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>

                            {recentActivity.length === 0 ? (
                                <div className="p-8 text-center text-[var(--muted)] text-xs">
                                    Sin movimientos recientes.
                                </div>
                            ) : (
                                <div className="p-2 overflow-y-auto max-h-[272px]">
                                    {recentActivity.map((item, i) => (
                                        <ActivityRow key={`${item.id}-${i}`} item={item} symbol={currencySymbol} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Metas de ahorro */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-[var(--foreground)]">Metas de Ahorro</h3>
                                <p className="text-[10px] text-[var(--muted)] font-medium">
                                    {fmt(totalSavedInGoals)} acumulados en {goals.length} meta{goals.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link to="/goals" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5">
                                    Ver todo <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>

                        {goals.length === 0 ? (
                            <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-10 text-center">
                                <Target className="w-10 h-10 text-[var(--muted)]/30 mx-auto mb-3" />
                                <p className="text-[var(--muted)] text-sm font-medium mb-3">Aún no tienes metas creadas.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {goals.slice(0, 4).map(goal => {
                                    const pct = goal.target_amount > 0
                                        ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100))
                                        : 0;
                                    const daysLeft = Math.max(0, Math.ceil(
                                        (new Date(goal.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                                    ));
                                    const pctColor = pct >= 75 ? '#10b981' : pct >= 40 ? '#6366f1' : '#f87171';

                                    return (
                                        <Link
                                            key={goal.id}
                                            to="/goals"
                                            className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-5 hover:border-indigo-500/40 transition-all group"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <p className="text-sm font-bold text-[var(--foreground)] truncate">{goal.name}</p>
                                                <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-md flex-shrink-0 ml-1">
                                                    {pct}%
                                                </span>
                                            </div>

                                            {/* Barra de progreso */}
                                            <div className="w-full h-1.5 bg-[var(--card-border)] rounded-full mb-3">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${pct}%`, backgroundColor: pctColor }}
                                                />
                                            </div>

                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-[10px] text-[var(--muted)] font-medium">Acumulado</p>
                                                    <p className="text-sm font-black text-[var(--foreground)]">
                                                        {fmt(goal.current_amount)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-[var(--muted)] font-medium">Meta</p>
                                                    <p className="text-xs font-bold text-[var(--muted)]">
                                                        {fmt(goal.target_amount)}
                                                    </p>
                                                </div>
                                            </div>

                                            <p className="text-[10px] text-[var(--muted)] font-medium mt-2">
                                                {daysLeft > 0 ? `${daysLeft} días restantes` : 'Fecha vencida'}
                                            </p>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>
            )}
        </main>
    );
};