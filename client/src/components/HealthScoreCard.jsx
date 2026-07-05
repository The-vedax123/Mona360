import { HeartPulse } from 'lucide-react';
import { healthLabel } from '../utils/calculations.js';

const STROKE = {
  emerald: '#10b981',
  brand: '#6366f1',
  amber: '#f59e0b',
  red: '#ef4444',
};

export default function HealthScoreCard({ score = 0, subtitle }) {
  const { label, tone } = healthLabel(score);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="card relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-500/10 blur-2xl" />
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
        <HeartPulse className="h-4 w-4 text-brand-500" />
        Mona360 Health Score
      </div>
      <div className="mt-4 flex items-center gap-5">
        <div className="relative grid place-items-center">
          <svg width="128" height="128" className="-rotate-90">
            <circle cx="64" cy="64" r={radius} strokeWidth="12" className="fill-none stroke-slate-200 dark:stroke-white/10" />
            <circle
              cx="64"
              cy="64"
              r={radius}
              strokeWidth="12"
              strokeLinecap="round"
              stroke={STROKE[tone]}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="fill-none transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{score}</span>
            <span className="text-[11px] font-medium text-slate-400">/ 100</span>
          </div>
        </div>
        <div>
          <span
            className="inline-flex rounded-full px-3 py-1 text-sm font-bold"
            style={{ backgroundColor: `${STROKE[tone]}22`, color: STROKE[tone] }}
          >
            {label}
          </span>
          <p className="mt-2 max-w-[16rem] text-sm text-slate-500 dark:text-slate-400">
            {subtitle ||
              'A real-time AI assessment of your business performance based on sales, profitability, cash flow, expenses, inventory health and customer activity.'}
          </p>
        </div>
      </div>
    </div>
  );
}
