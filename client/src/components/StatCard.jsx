import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

const ICON_TONES = {
  brand: 'bg-brand-500 text-white',
  emerald: 'bg-emerald-500 text-white',
  amber: 'bg-amber-500 text-white',
  orange: 'bg-orange-500 text-white',
  red: 'bg-red-500 text-white',
  accent: 'bg-accent-500 text-white',
  blue: 'bg-blue-500 text-white',
  violet: 'bg-violet-500 text-white',
};

const VALUE_TONES = {
  brand: 'text-brand-600 dark:text-brand-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
  amber: 'text-amber-600 dark:text-amber-400',
  orange: 'text-orange-600 dark:text-orange-400',
  red: 'text-red-600 dark:text-red-400',
  accent: 'text-accent-600 dark:text-accent-400',
  blue: 'text-blue-600 dark:text-blue-400',
  violet: 'text-violet-600 dark:text-violet-400',
};

export default function StatCard({ label, value, icon: Icon, tone = 'brand', trend, hint, colorValue = true }) {
  const positive = trend != null && trend >= 0;
  return (
    <div className="card p-4 shadow-soft sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
          <p
            className={`mt-2 truncate text-2xl font-extrabold ${
              colorValue ? VALUE_TONES[tone] : 'text-slate-900 dark:text-white'
            }`}
          >
            {value}
          </p>
        </div>
        {Icon && (
          <div
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-full shadow-soft ${ICON_TONES[tone] || ICON_TONES.brand}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs">
        {hint && <span className="text-slate-400 dark:text-slate-500">{hint}</span>}
        {trend != null && (
          <span
            className={`ml-auto inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold ${
              positive ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/15 text-red-500'
            }`}
          >
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend).toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
}
