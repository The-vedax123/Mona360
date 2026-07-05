import { HeartPulse, TrendingUp, Receipt, Wallet, Sparkles, ArrowUpRight } from 'lucide-react';

const bars = [40, 55, 48, 70, 62, 85, 78, 92];

export default function DashboardPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-white/10 dark:bg-navy-900">
      {/* Top bar */}
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 dark:border-white/5">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-amber-400" />
        <span className="h-3 w-3 rounded-full bg-emerald-400" />
        <span className="ml-3 text-xs font-medium text-slate-400">BusinessBrain AI · Dashboard</span>
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-3 sm:p-6">
        {/* Health score */}
        <div className="rounded-xl border border-slate-100 p-4 dark:border-white/5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <HeartPulse className="h-4 w-4 text-brand-500" /> Health Score
          </div>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-4xl font-black text-slate-900 dark:text-white">86</span>
            <span className="mb-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-500">Good</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
            <div className="h-full w-[86%] rounded-full bg-gradient-to-r from-brand-500 to-accent-500" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:col-span-2">
          {[
            { label: 'Revenue', value: 'K 8,200', icon: TrendingUp, tone: 'text-emerald-500' },
            { label: 'Expenses', value: 'K 6,850', icon: Receipt, tone: 'text-amber-500' },
            { label: 'Net Profit', value: 'K 1,350', icon: ArrowUpRight, tone: 'text-brand-500' },
            { label: 'Wallet', value: 'K 17,850', icon: Wallet, tone: 'text-accent-500' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-100 p-3 dark:border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{s.label}</span>
                <s.icon className={`h-4 w-4 ${s.tone}`} />
              </div>
              <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="rounded-xl border border-slate-100 p-4 dark:border-white/5 sm:col-span-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Revenue trend</p>
          <div className="mt-4 flex h-28 items-end gap-2">
            {bars.map((h, i) => (
              <div key={i} className="flex-1">
                <div
                  className="rounded-t-md bg-gradient-to-t from-brand-500/40 to-brand-500"
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* AI insight */}
        <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-500">
            <Sparkles className="h-4 w-4" /> AI Recommendation
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            &ldquo;Rice is your top seller but low on stock. Restock soon to avoid missed sales.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
