import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ReportsService {
    constructor(private supabase: SupabaseService) { }

    async getDashboard(userId: string) {
        const supabase = this.supabase.getAdminClient();
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
        const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

        // 1. Total Capital and Account Balances
        const { data: accounts, error: accountsError } = await supabase
            .from('funding_accounts')
            .select('name, balance')
            .eq('user_id', userId);

        if (accountsError) throw accountsError;
        const total_capital = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
        const accounts_balance = accounts.map((acc) => ({
            name: acc.name,
            balance: acc.balance,
            percentage: total_capital > 0 ? (acc.balance / total_capital) * 100 : 0,
        }));

        // 2. Monthly Income
        const { data: incomes, error: incomesError } = await supabase
            .from('income_transactions')
            .select('amount, income_categories(name), funding_accounts!inner(user_id)')
            .gte('created_at', firstDayOfMonth)
            .eq('funding_accounts.user_id', userId);

        if (incomesError) throw incomesError;
        const monthly_income = incomes.reduce((sum, inc) => sum + (inc.amount || 0), 0);

        // 3. Incomes by Category
        const incomesByCategoryMap = new Map<string, number>();
        incomes.forEach((inc: any) => {
            const categoryName = inc.income_categories?.name || 'Otro';
            const currentAmount = incomesByCategoryMap.get(categoryName) || 0;
            incomesByCategoryMap.set(categoryName, currentAmount + inc.amount);
        });

        const incomes_by_category = Array.from(incomesByCategoryMap.entries()).map(([category, amount]) => ({
            category,
            amount,
            percentage: monthly_income > 0 ? (amount / monthly_income) * 100 : 0,
        }));

        // 4. Monthly Expenses
        const { data: expenses, error: expensesError } = await supabase
            .from('expense_transactions')
            .select('amount, description, created_at, expense_categories(name), funding_accounts!inner(user_id)')
            .gte('created_at', firstDayOfMonth)
            .eq('funding_accounts.user_id', userId);

        if (expensesError) throw expensesError;
        const monthly_expenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

        // 5. Expenses by Category
        const expensesByCategoryMap = new Map<string, number>();
        expenses.forEach((exp: any) => {
            const categoryName = exp.expense_categories?.name || 'Uncategorized';
            const currentAmount = expensesByCategoryMap.get(categoryName) || 0;
            expensesByCategoryMap.set(categoryName, currentAmount + exp.amount);
        });

        const expenses_by_category = Array.from(expensesByCategoryMap.entries()).map(([category, amount]) => ({
            category,
            amount,
            percentage: monthly_expenses > 0 ? (amount / monthly_expenses) * 100 : 0,
        }));

        // 6. Top 5 Expenses
        const top_expenses = [...expenses]
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5)
            .map((exp) => ({
                description: exp.description,
                amount: exp.amount,
                date: exp.created_at,
            }));

        // 7. Last Month Expenses (for comparison)
        const { data: lastMonthExpenses, error: lastMonthError } = await supabase
            .from('expense_transactions')
            .select('amount, funding_accounts!inner(user_id)')
            .gte('created_at', firstDayOfLastMonth)
            .lte('created_at', lastDayOfLastMonth)
            .eq('funding_accounts.user_id', userId);

        if (lastMonthError) throw lastMonthError;
        const last_month_expenses_total = lastMonthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

        // 8. Savings Progress
        const { data: savings, error: savingsError } = await supabase
            .from('savings_goals')
            .select('name, current_amount, target_amount')
            .eq('user_id', userId);

        if (savingsError) throw savingsError;
        const total_saved = savings.reduce((sum, goal) => sum + (goal.current_amount || 0), 0);
        const savings_progress = savings.map((goal) => ({
            name: goal.name,
            current_amount: goal.current_amount,
            target_amount: goal.target_amount,
            progress: goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0,
        }));

        return {
            summary: {
                total_capital,
                monthly_income,
                monthly_expenses,
                net_savings: monthly_income - monthly_expenses,
                income_expense_ratio: monthly_income > 0 ? (monthly_expenses / monthly_income) * 100 : 0,
                total_saved,
            },
            accounts_balance,
            incomes_by_category,
            expenses_by_category,
            top_expenses,
            savings_progress,
            monthly_comparison: {
                current_month_expenses: monthly_expenses,
                last_month_expenses: last_month_expenses_total,
                diff_percentage:
                    last_month_expenses_total > 0
                        ? ((monthly_expenses - last_month_expenses_total) / last_month_expenses_total) * 100
                        : 0,
            },
        };
    }
}
