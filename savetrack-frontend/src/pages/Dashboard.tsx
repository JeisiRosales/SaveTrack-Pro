import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Wallet, Target, LogOut } from 'lucide-react';

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex">
            {/* Sidebar Placeholder */}
            <aside className="w-64 bg-slate-900 text-white p-6 hidden md:flex flex-col">
                <h2 className="text-2xl font-bold mb-10 text-[#0051FF]">SaveTrack Pro</h2>
                <nav className="flex-1 space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-[#0051FF20] text-[#0051FF] rounded-xl cursor-not-allowed opacity-50">
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </div>
                    <div className="flex items-center gap-3 p-3 text-slate-400 hover:text-white transition-colors cursor-not-allowed">
                        <Wallet className="w-5 h-5" />
                        Cuentas
                    </div>
                    <div className="flex items-center gap-3 p-3 text-slate-400 hover:text-white transition-colors cursor-not-allowed">
                        <Target className="w-5 h-5" />
                        Metas
                    </div>
                </nav>
                <button
                    onClick={logout}
                    className="flex items-center gap-3 p-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    Cerrar Sesión
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Hola, {user?.name || 'Usuario'} 👋</h1>
                        <p className="text-gray-500">Aquí tienes el resumen de tus ahorros.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Tarjeta de Saldo Total */}
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 col-span-2">
                        <p className="text-gray-500 text-sm font-medium">SALDO TOTAL DISPONIBLE</p>
                        <h2 className="text-5xl font-black text-gray-900 mt-2">$0.00</h2>
                        <div className="mt-8 flex gap-4">
                            <button className="bg-[#0051FF] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0041CC] transition-all">
                                + Nueva Cuenta
                            </button>
                        </div>
                    </div>

                    {/* Tarjeta de Info rápida */}
                    <div className="bg-[#0051FF] p-8 rounded-[2rem] text-white shadow-xl shadow-blue-200 flex flex-col justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium uppercase">Próxima Meta</p>
                            <h3 className="text-2xl font-bold mt-1">Sin metas activas</h3>
                        </div>
                        <button className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl font-bold transition-all mt-6">
                            Crear Meta 🚀
                        </button>
                    </div>
                </div>

                <div className="mt-12 text-center p-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                    <p className="text-gray-400">Pronto verás aquí el detalle de tus cuentas y metas con tiempo real.</p>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
