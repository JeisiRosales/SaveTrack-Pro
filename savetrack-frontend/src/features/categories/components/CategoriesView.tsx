import { useState } from 'react';
import { useExpenseCategories } from '@/features/expense/hooks/useExpenseCategories';
import { useIncomeCategories } from '@/features/income/hooks/useIncomeCategories';
import { CategoryList } from '@/features/categories/components/CategoryList';
import { TrendingUp, TrendingDown, Menu, Tag } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

interface ContextType {
    toggleSidebar: () => void;
}

const Categories = () => {
    const [tab, setTab] = useState<'expenses' | 'incomes'>('expenses');
    const { toggleSidebar } = useOutletContext<ContextType>();

    // Hooks
    const expenses = useExpenseCategories();
    const incomes = useIncomeCategories();

    return (
        <div className="flex-1 p-6 lg:p-10 relative overflow-x-hidden min-h-screen bg-[var(--background)]">
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
                        <Tag className="w-6 h-6 text-[var(--accent-text)]" />
                        Mis Categorías
                    </h1>
                    <p className="text-[var(--muted)] text-xs mt-1 font-medium">Gestiona tus categorías de gastos e ingresos.</p>
                </div>
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-2.5 bg-[var(--card)] border border-[var(--card-border)] rounded-xl"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </header>

            <div className="mb-8 flex bg-[var(--card)] p-1.5 rounded-2xl border border-[var(--card-border)] w-fit backdrop-blur-md">
                <button
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'expenses' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]'}`}
                    onClick={() => setTab('expenses')}
                >
                    <TrendingDown className="w-4 h-4" /> Gastos
                </button>
                <button
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'incomes' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25' : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]'}`}
                    onClick={() => setTab('incomes')}
                >
                    <TrendingUp className="w-4 h-4" /> Ingresos
                </button>
            </div>

            <div className="flex justify-start animation-fade-in relative">
                {tab === 'expenses' ? (
                    <CategoryList
                        title="Categorías de Gastos"
                        icon={<TrendingDown className="w-5 h-5 text-indigo-500" />}
                        categories={expenses.categories}
                        loading={expenses.loading}
                        onAdd={(name, isFixed) => expenses.addCategory(name, isFixed)}
                        onRemove={expenses.removeCategory}
                        onUpdate={(id, name, isFixed) => expenses.updateCategory(id, name, isFixed)}
                        showIsFixed={true}
                    />
                ) : (
                    <CategoryList
                        title="Categorías de Ingresos"
                        icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
                        categories={incomes.categories}
                        loading={incomes.loading}
                        onAdd={(name) => incomes.addCategory(name)}
                        onRemove={incomes.removeCategory}
                        onUpdate={(id, name) => incomes.updateCategory(id, name)}
                        showIsFixed={false}
                    />
                )}
            </div>
        </div>
    );
};

export default Categories;