import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Sparkles, TrendingUp, Receipt, PiggyBank, Boxes, FileText, ArrowUp, ArrowDown, AlertTriangle, Target } from 'lucide-react';
import Page from '../components/ui/Page.jsx';
import ChartCard from '../components/ChartCard.jsx';
import StatCard from '../components/StatCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { useBusiness } from '../hooks/useBusiness.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { useChartTheme } from '../hooks/useChartTheme.js';
import { api } from '../services/api.js';
import { computeMetrics, localBusinessReport } from '../utils/aiLogic.js';
import {
  totalRevenue,
  totalExpenses,
  netProfit,
  profitMargin,
  expensesByCategory,
  inventoryValue,
  lowStockProducts,
  buildTrend,
} from '../utils/calculations.js';
import { formatCurrency } from '../utils/format.js';

const COLORS = ['#6366f1', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#a855f7'];

export default function Reports() {
  const state = useBusiness();
  const { business, sales, expenses, inventory } = state;
  const toast = useToast();
  const chart = useChartTheme();
  const currency = business?.currency || 'ZMW';

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const revenue = totalRevenue(sales);
  const exp = totalExpenses(expenses);
  const profit = netProfit(sales, expenses);
  const margin = profitMargin(sales, expenses);
  const trend = useMemo(() => buildTrend(sales, expenses, 14), [sales, expenses]);
  const expenseCats = useMemo(() => expensesByCategory(expenses), [expenses]);
  const low = lowStockProducts(inventory);

  const generate = async () => {
    setLoading(true);
    const metrics = computeMetrics(state);
    try {
      const result = await api.aiReport(metrics);
      setReport(result);
      toast.success('Mona AI report generated');
    } catch {
      setReport(localBusinessReport(metrics));
      toast.info('Mona AI report generated (offline mode)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page
      title="Mona360 Insights"
      subtitle="Intelligent business intelligence — not just static reports."
      action={
        <button onClick={generate} disabled={loading} className="btn-primary">
          <Sparkles className="h-4 w-4" /> {loading ? 'Generating…' : 'Generate Mona AI Report'}
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue" value={formatCurrency(revenue, currency)} icon={TrendingUp} tone="emerald" />
        <StatCard label="Expenses" value={formatCurrency(exp, currency)} icon={Receipt} tone="amber" />
        <StatCard label="Net Profit" value={formatCurrency(profit, currency)} icon={PiggyBank} tone={profit >= 0 ? 'brand' : 'red'} hint={`${margin.toFixed(1)}% margin`} />
        <StatCard label="Stock Value" value={formatCurrency(inventoryValue(inventory), currency)} icon={Boxes} tone="accent" hint={`${low.length} low`} />
      </div>

      {/* AI summary report */}
      <div className="card mt-4 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 bg-brand-500/5 p-5 dark:border-white/5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-500" />
            <h3 className="font-bold text-slate-900 dark:text-white">Mona AI Report</h3>
          </div>
          {report && <span className="text-xs text-slate-400">Generated just now</span>}
        </div>
        <div className="p-5">
          {loading ? (
            <LoadingSpinner label="Analysing your business…" />
          ) : report ? (
            <div className="space-y-5">
              <p className="rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-700 dark:bg-white/5 dark:text-slate-200">
                {report.headline}
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <ReportBlock icon={ArrowUp} tone="emerald" title="What improved" items={report.sections.improved} />
                <ReportBlock icon={ArrowDown} tone="red" title="What declined" items={report.sections.declined} />
                <ReportBlock icon={AlertTriangle} tone="amber" title="Risks" items={report.sections.risks} />
                <ReportBlock icon={Target} tone="brand" title="Recommended next actions" items={report.sections.nextActions} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-500">
                <FileText className="h-7 w-7" />
              </div>
              <p className="mt-3 font-semibold text-slate-900 dark:text-white">No report generated yet</p>
              <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                Click <b>Generate Mona AI Report</b> to get a summary of what improved, what declined, key risks and
                recommended next actions.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Revenue Report" subtitle="Daily revenue (last 14 days)">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={trend} margin={{ left: -20, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} width={48} />
              <Tooltip contentStyle={chart.tooltip} formatter={(v) => formatCurrency(v, currency)} cursor={{ fill: chart.cursor }} />
              <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Expense Report" subtitle="By category">
          {expenseCats.length ? (
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={expenseCats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={48} paddingAngle={2}>
                  {expenseCats.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chart.tooltip} formatter={(v) => formatCurrency(v, currency)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-16 text-center text-sm text-slate-400">No expense data yet.</p>
          )}
        </ChartCard>
      </div>

      <div className="mt-4">
        <ChartCard title="Profit Report" subtitle="Daily net profit (last 14 days)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trend} margin={{ left: -20, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} width={48} />
              <Tooltip contentStyle={chart.tooltip} formatter={(v) => formatCurrency(v, currency)} cursor={{ fill: chart.cursor }} />
              <Bar dataKey="profit" name="Profit" radius={[6, 6, 0, 0]}>
                {trend.map((d, i) => (
                  <Cell key={i} fill={d.profit >= 0 ? '#6366f1' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </Page>
  );
}

const TONE = {
  emerald: 'bg-emerald-500/15 text-emerald-500',
  red: 'bg-red-500/15 text-red-500',
  amber: 'bg-amber-500/15 text-amber-500',
  brand: 'bg-brand-500/15 text-brand-500',
};

function ReportBlock({ icon: Icon, tone, title, items }) {
  return (
    <div className="rounded-xl border border-slate-100 p-4 dark:border-white/5">
      <div className="mb-2 flex items-center gap-2">
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${TONE[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
        <h4 className="font-semibold text-slate-900 dark:text-white">{title}</h4>
      </div>
      <ul className="space-y-1.5">
        {items.map((t, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
