import React from 'react';

const LABELS = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
const COLORS = ['bg-red-500', 'bg-green-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];

const PasswordStrengthMeter = ({ strength = 0 }) => {
    const normalized = Math.max(0, Math.min(5, Number(strength) || 0));
    const activeColor = normalized > 0 ? COLORS[normalized - 1] : 'bg-slate-300';
    const label = normalized > 0 ? LABELS[normalized - 1] : 'Too short';

    return (
        <div className="space-y-2" aria-live="polite">
            <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                    className={`h-full ${activeColor} transition-all duration-300`}
                    style={{ width: `${(normalized / 5) * 100}%` }}
                />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
                Password strength: <span className="font-medium">{label}</span>
            </p>
        </div>
    );
};

export default PasswordStrengthMeter;
