import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

const TONES = {
  brand: 'from-brand-500/20 to-brand-500/5 text-brand-500',
  emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-500',
  amber: 'from-amber-500/20 to-amber-500/5 text-amber-500',
  red: 'from-red-500/20 to-red-500/5 text-red-500',
  accent: 'from-accent-500/20 to-accent-500/5 text-accent-500',
};

export default function StatCard({ label, value, icon: Icon, tone = 'brand', trend, hint }) {
  const positive = trend != null && trend >= 0;
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-2 truncate text-2xl font-extrabold text-slate-900 dark:text-white">{value}</p>
        </div>
        {Icon && (
          <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${TONES[tone]}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {(trend != null || hint) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend != null && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold ${
                positive ? 'text-emerald-500' : 'text-red-500'
              }`}
            >
              {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {Math.abs(trend).toFixed(1)}%
            </span>
          )}
          {hint && <span className="text-slate-400 dark:text-slate-500">{hint}</span>}
        </div>
      )}
    </div>
  );
}
