import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import CustomDropdown from '../components/ui/CustomDropdown';
import api from '../lib/api';
import {
    ArrowUpCircle,
    Search,
    Filter,
    Menu,
    Calendar,
    Wallet,
    Download,
    Loader2,
    TrendingUp,
    TrendingDown,
    Activity,
    Plus,
    Minus,
    Tag
} from 'lucide-react';

interface Transaction {
    id: string;
    amount: number;
    type: 'deposit' | 'withdrawal';
    created_at: string;
    account_id: string;
    account_name: string;
    funding_accounts?: {
        name: string;
    };
    savings_goals?: {
        name: string;
    };
}

interface Account {
    id: string;
    name: string;
    balance: number;
}

const Transactions: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [transactions, setTransactions] = React.useState<Transaction[]>([]);
    const [accounts, setAccounts] = React.useState<Account[]>([]);

    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<'All' | 'deposit' | 'withdrawal'>('All');
    const [accountFilter, setAccountFilter] = useState<string>('All');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [transRes, accRes] = await Promise.all([
                    api.get('/transactions'),
                    api.get('/funding-accounts')
                ]);
                setTransactions(Array.isArray(transRes.data) ? transRes.data : []);
                setAccounts(Array.isArray(accRes.data) ? accRes.data : []);
            } catch (err) {
                console.error("Error fetching transactions:", err);
                setTransactions([]);
                setAccounts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredTransactions = transactions.filter(t => {
        const description = `${t.savings_goals?.name || 'Ahorro'} (${t.type === 'deposit' ? 'Depósito' : 'Retiro'})`;
        const matchesSearch = description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'All' || t.type === typeFilter;
        const matchesAccount = accountFilter === 'All' || t.account_id === accountFilter;
        return matchesSearch && matchesType && matchesAccount;
    });

    const totalIncomes = filteredTransactions
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalExpenses = filteredTransactions
        .filter(t => t.type === 'withdrawal')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

    // Preparar opciones para CustomDropdown
    const typeOptions = [
        { value: 'All', label: 'Todos los Tipos', icon: <Tag className="w-3 h-3" /> },
        { value: 'deposit', label: 'Depósitos', icon: <Plus className="w-3 h-3 text-emerald-500" /> },
        { value: 'withdrawal', label: 'Retiros', icon: <Minus className="w-3 h-3 text-rose-500" /> },
    ];

    const accountOptions = [
        { value: 'All', label: 'Todas las Cuentas', icon: <Wallet className="w-3 h-3" /> },
        ...accounts.map(acc => ({
            value: acc.id,
            label: acc.name,
            icon: <Wallet className="w-3 h-3 text-indigo-500" />
        }))
    ];

    // Exportar a CSV
    const exportToCSV = () => {
        // 1. Encabezados claros
        const headers = "Fecha,Meta,Flujo,Cuenta Origen,Tipo,Monto\n";

        // 2. Transformación con manejo de nulos y fechas limpias
        const rows = transactions.map(t => {
            const fecha = new Date(t.created_at).toLocaleDateString();
            const meta = t.savings_goals?.name || 'General';
            const flujo = t.type === 'deposit' ? 'Ingreso' : 'Egreso';
            const cuenta = t.account_name || 'Principal';

            return `${fecha},"${meta}",${flujo},"${cuenta}",${t.type},${t.amount}`;
        }).join("\n");

        // 3. Creación del archivo con BOM para que Excel reconozca tildes (UTF-8)
        const blob = new Blob(["\ufeff" + headers + rows], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        // 4. Descarga automática
        const link = document.createElement("a");
        link.href = url;
        link.download = `transacciones_savetrack_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Limpieza de memoria
    };

    return (
        <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 p-6 lg:p-10 relative overflow-x-hidden">
                {/* Header */}
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Activity className="w-5 h-5 text-[var(--accent-text)]" />
                            <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Historial de Transacciones</h1>
                        </div>
                        <p className="text-[var(--muted)] text-xs font-medium tracking-wider">
                            Control detallado de tus movimientos.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-3 bg-[var(--card)] rounded-xl hover:bg-[var(--background)] transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--card-border)] shadow-sm">
                        <p className="text-[var(--muted)] text-xl font-bold mb-2">Total Depósitos</p>
                        <div className="flex items-end justify-between">
                            <h3 className="text-2xl font-bold text-emerald-500">${totalIncomes.toLocaleString()}</h3>
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-emerald-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--card-border)] shadow-sm">
                        <p className="text-[var(--muted)] text-xl font-bold mb-2">Total Retiros</p>
                        <div className="flex items-end justify-between">
                            <h3 className="text-2xl font-bold text-rose-500">${totalExpenses.toLocaleString()}</h3>
                            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                                <TrendingDown className="w-5 h-5 text-rose-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--card-border)] shadow-sm">
                        <p className="text-[var(--muted)] text-xl font-bold mb-2">Balance Neto</p>
                        <div className="flex items-end justify-between">
                            <h3 className={`text-2xl font-bold ${totalIncomes - totalExpenses >= 0 ? 'text-indigo-500' : 'text-rose-500'}`}>
                                ${(totalIncomes - totalExpenses).toLocaleString()}
                            </h3>
                            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                                <ArrowUpCircle className="w-5 h-5 text-indigo-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--card-border)] mb-6 shadow-sm">
                    <div className="flex flex-col lg:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                            <input
                                type="text"
                                placeholder="Buscar por meta..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                            <CustomDropdown
                                options={typeOptions}
                                value={typeFilter}
                                onChange={(val) => setTypeFilter(val as any)}
                                icon={<Filter className="w-4 h-4" />}
                                className="w-full sm:w-[180px]"
                            />

                            <CustomDropdown
                                options={accountOptions}
                                value={accountFilter}
                                onChange={setAccountFilter}
                                icon={<Wallet className="w-4 h-4" />}
                                className="w-full sm:w-[200px]"
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-[var(--card)] rounded-2xl border border-[var(--card-border)] overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="p-20 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                            <p className="text-[var(--muted)] text-sm font-medium">Cargando transacciones...</p>
                        </div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="p-20 text-center">
                            <p className="text-[var(--muted)] font-medium">No se encontraron transacciones.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[var(--background)] border-b border-[var(--card-border)]">
                                        <th className="px-6 py-4 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Fecha</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Flujo</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Cuenta Origen</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Tipo</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider text-right">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--card-border)]">
                                    {filteredTransactions.map((t) => {
                                        const isDeposit = t.type === 'deposit';
                                        return (
                                            <tr key={t.id} className="hover:bg-[var(--background)] transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-3.5 h-3.5 text-[var(--muted)]" />
                                                        <span className="text-xs font-medium">{t.created_at ? new Date(t.created_at).toLocaleDateString() : '---'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-[var(--foreground)]">
                                                            {t.savings_goals?.name || 'Ahorro General'}
                                                        </span>
                                                        <span className="text-[10px] text-[var(--muted)] font-medium italic">
                                                            {isDeposit ? 'Hacia Meta' : 'Desde Meta'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2.5 py-1 bg-[var(--accent-soft)] text-[var(--accent-text)] text-[10px] font-bold rounded-lg uppercase">
                                                        {t.funding_accounts?.name || 'Desconocida'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${isDeposit ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                            {isDeposit ? <Plus className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                                                        </div>
                                                        <span className={`text-xs font-bold ${isDeposit ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                            {isDeposit ? 'Depósito' : 'Retiro'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`text-sm font-black ${isDeposit ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                        {isDeposit ? '+' : '-'}${t.amount?.toLocaleString() || '0'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                <div className="flex justify-end mt-4">
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--card)] border border-[var(--card-border)] rounded-xl text-xs font-bold hover:bg-[var(--accent-soft)] transition-all"
                    >
                        <Download className="w-4 h-4" />
                        Exportar CSV
                    </button>
                </div>
            </main>
        </div>
    );
};

export default Transactions;
