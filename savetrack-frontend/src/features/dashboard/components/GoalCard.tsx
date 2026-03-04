import { Goal } from '../types';

export const GoalCard = ({ goal }: { goal: Goal }) => {
    const progress = Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100);

    return (
        <div className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--card-border)] shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-3">
                <p className="text-[10px] text-[var(--muted)] font-semibold">
                    Restan {Math.max(0, Math.ceil((new Date(goal.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} días
                </p>
                <span className="text-[10px] font-bold text-[var(--accent-text)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-full">
                    {progress}%
                </span>
            </div>

            <h4 className="font-bold text-[var(--foreground)] text-sm mb-1">{goal.name}</h4>
            <div className="flex items-baseline gap-1.5 mb-3">
                <span className="text-base font-bold text-[var(--accent-text)]">${goal.current_amount?.toLocaleString()}</span>
                <span className="text-[10px] text-[var(--muted)] font-medium">/ ${goal.target_amount?.toLocaleString()}</span>
            </div>
        </div>
    );
};