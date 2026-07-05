import { AlertTriangle, TrendingUp, Boxes, Receipt, Info, Sparkles } from 'lucide-react';

const TYPE_META = {
  risk: { icon: AlertTriangle, tone: 'red' },
  growth: { icon: TrendingUp, tone: 'emerald' },
  inventory: { icon: Boxes, tone: 'amber' },
  sales: { icon: TrendingUp, tone: 'brand' },
  expense: { icon: Receipt, tone: 'amber' },
  info: { icon: Info, tone: 'brand' },
};

const PRIORITY_TONE = {
  high: 'bg-red-500/15 text-red-500',
  medium: 'bg-amber-500/15 text-amber-500',
  low: 'bg-emerald-500/15 text-emerald-500',
};

const BORDER = {
  red: 'border-l-red-500',
  emerald: 'border-l-emerald-500',
  amber: 'border-l-amber-500',
  brand: 'border-l-brand-500',
};

export default function AIInsightCard({ insight }) {
  const meta = TYPE_META[insight.insight_type] || TYPE_META.info;
  const Icon = meta.icon;
  return (
    <div className={`card border-l-4 p-4 ${BORDER[meta.tone]}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg ${PRIORITY_TONE[insight.priority]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-slate-900 dark:text-white">{insight.title}</h4>
            <span className={`chip ${PRIORITY_TONE[insight.priority]} capitalize`}>{insight.priority}</span>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{insight.message}</p>
        </div>
      </div>
    </div>
  );
}

export function AIInsightHeader() {
  return (
    <div className="flex items-center gap-2">
      <Sparkles className="h-4 w-4 text-brand-500" />
      <span className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        AI Recommendations
      </span>
    </div>
  );
}
