import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Receipt,
  Wallet,
  PiggyBank,
  Boxes,
  ArrowRight,
  Sparkles,
  Rocket,
  Plus,
} from 'lucide-react';
import Page from '../components/ui/Page.jsx';
import StatCard from '../components/StatCard.jsx';
import HealthScoreCard from '../components/HealthScoreCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import AIInsightCard, { AIInsightHeader } from '../components/AIInsightCard.jsx';
import SalesTable from '../components/SalesTable.jsx';
import ExpenseTable from '../components/ExpenseTable.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Badge from '../components/ui/Badge.jsx';
import { useBusiness } from '../hooks/useBusiness.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { generateInsights } from '../utils/aiLogic.js';
import {
  totalRevenue,
  totalExpenses,
  netProfit,
  profitMargin,
  businessHealthScore,
  cashFlowStatus,
  inventoryRisk,
  expensesByCategory,
  buildTrend,
} from '../utils/calculations.js';
import { formatCurrency } from '../utils/format.js';
import { useChartTheme } from '../hooks/useChartTheme.js';

const PIE_COLORS = ['#6366f1', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#a855f7'];

const CASH_ICON = {
  emerald: 'bg-emerald-500/15 text-emerald-500',
  amber: 'bg-amber-500/15 text-amber-500',
  red: 'bg-red-500/15 text-red-500',
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 18) return 'Good Afternoon';
  return 'Good Evening';
}

export default function Dashboard() {
  const { business, sales, expenses, inventory, invoices, walletTransactions, isEmpty, loadDemoData } = useBusiness();
  const toast = useToast();
  const chart = useChartTheme();
  const currency = business?.currency || 'ZMW';

  const metrics = useMemo(() => {
    const revenue = totalRevenue(sales);
    const exp = totalExpenses(expenses);
    return {
      revenue,
      exp,
      profit: netProfit(sales, expenses),
      margin: profitMargin(sales, expenses),
      health: businessHealthScore({ sales, expenses, inventory }),
      cash: cashFlowStatus(sales, expenses),
      risk: inventoryRisk(inventory),
    };
  }, [sales, expenses, inventory]);

  const trend = useMemo(() => buildTrend(sales, expenses, 14), [sales, expenses]);
  const expenseCats = useMemo(() => expensesByCategory(expenses), [expenses]);
  const insights = useMemo(
    () => generateInsights({ business, sales, expenses, inventory, invoices, walletTransactions }),
    [business, sales, expenses, inventory, invoices, walletTransactions]
  );

  const walletBalance = walletTransactions.reduce(
    (sum, t) => sum + (t.transaction_type === 'received' ? Number(t.amount) : -Number(t.amount)),
    0
  );

  const handleLoadDemo = () => {
    loadDemoData();
    toast.success('Demo business loaded — explore the full dashboard.');
  };

  return (
    <Page
      title={`${greeting()}, ${business?.owner_name?.split(' ')[0] || 'there'} 👋`}
      subtitle="Here's what's happening in your business today."
      action={
        isEmpty ? (
          <button onClick={handleLoadDemo} className="btn-primary hidden sm:inline-flex">
            <Rocket className="h-4 w-4" /> Load Demo Business
          </button>
        ) : (
          <Link to="/app/advisor" className="btn-primary hidden sm:inline-flex">
            <Sparkles className="h-4 w-4" /> Ask Mona AI
          </Link>
        )
      }
    >
      {isEmpty && (
        <div className="card mb-4 flex flex-col gap-4 border-brand-500/30 bg-gradient-to-br from-brand-500/10 to-accent-500/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-500/15 text-brand-500">
              <Rocket className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Your business is ready to build</h3>
              <p className="mt-0.5 max-w-xl text-sm text-slate-500 dark:text-slate-400">
                Start by adding your first sale, expense or inventory item — your dashboard and Mona AI
                insights update in real time. Just presenting? Load an optional demo business to preview
                everything instantly.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Link to="/app/sales" className="btn-secondary">
              <Plus className="h-4 w-4" /> Add a sale
            </Link>
            <button onClick={handleLoadDemo} className="btn-primary">
              <Rocket className="h-4 w-4" /> Load Demo Business
            </button>
          </div>
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <HealthScoreCard score={metrics.health} />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          <StatCard label="Total Revenue" value={formatCurrency(metrics.revenue, currency)} icon={TrendingUp} tone="emerald" hint={`${sales.length} sales`} />
          <StatCard label="Total Expenses" value={formatCurrency(metrics.exp, currency)} icon={Receipt} tone="amber" hint={`${expenses.length} expenses`} />
          <StatCard label="Net Profit" value={formatCurrency(metrics.profit, currency)} icon={PiggyBank} tone={metrics.profit >= 0 ? 'brand' : 'red'} hint={`${metrics.margin.toFixed(1)}% margin`} />
          <StatCard label="Wallet Balance" value={formatCurrency(walletBalance, currency)} icon={Wallet} tone="accent" hint="Mona360 Wallet" />
        </div>
      </div>

      {/* Status strip */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="card flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className={`grid h-11 w-11 place-items-center rounded-xl ${CASH_ICON[metrics.cash.tone]}`}>
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Cash Flow Status</p>
              <p className="font-bold text-slate-900 dark:text-white">{metrics.cash.label}</p>
            </div>
          </div>
          <Badge tone={metrics.cash.tone}>{formatCurrency(metrics.cash.profit, currency)}</Badge>
        </div>
        <div className="card flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/15">
              <Boxes className="h-5 w-5 text-brand-500" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Inventory Risk</p>
              <p className="font-bold capitalize text-slate-900 dark:text-white">
                {inventory.length === 0 ? 'No items yet' : metrics.risk.level}
              </p>
            </div>
          </div>
          {inventory.length === 0 ? (
            <Link to="/app/inventory" className="chip bg-brand-500/15 text-brand-600 dark:text-brand-300">
              Add items
            </Link>
          ) : (
            <Badge tone={metrics.risk.level === 'high' ? 'red' : metrics.risk.level === 'medium' ? 'amber' : 'emerald'}>
              {metrics.risk.lowCount} low
            </Badge>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <ChartCard title="Revenue vs Expenses" subtitle="Last 14 days" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trend} margin={{ left: -20, right: 8, top: 4 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} width={48} />
              <Tooltip contentStyle={chart.tooltip} formatter={(v) => formatCurrency(v, currency)} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2} fill="url(#rev)" />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f59e0b" strokeWidth={2} fill="url(#exp)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Expenses by Category">
          {expenseCats.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={expenseCats} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} width={72} />
                <Tooltip contentStyle={chart.tooltip} formatter={(v) => formatCurrency(v, currency)} cursor={{ fill: chart.cursor }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {expenseCats.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No expenses yet" description="Add expenses to see your cost breakdown." />
          )}
        </ChartCard>
      </div>

      <div className="mt-4">
        <ChartCard title="Profit Trend" subtitle="Daily net profit over the last 14 days">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trend} margin={{ left: -20, right: 8, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} width={48} />
              <Tooltip contentStyle={chart.tooltip} formatter={(v) => formatCurrency(v, currency)} />
              <Line type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* AI recommendations */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <AIInsightHeader />
          <Link to="/app/advisor" className="text-sm font-semibold text-brand-500 hover:underline">
            Open Mona AI
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {insights.slice(0, 4).map((i) => (
            <AIInsightCard key={i.id} insight={i} />
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Recent Sales"
          action={<Link to="/app/sales" className="text-xs font-semibold text-brand-500 hover:underline">View all <ArrowRight className="inline h-3 w-3" /></Link>}
        >
          {sales.length ? (
            <SalesTable sales={sales.slice(0, 5)} currency={currency} />
          ) : (
            <EmptyState
              icon={TrendingUp}
              title="No sales yet"
              description="Add your first sale to start tracking revenue."
              action={
                <Link to="/app/sales" className="btn-primary">
                  <Plus className="h-4 w-4" /> Add a sale
                </Link>
              }
            />
          )}
        </ChartCard>

        <ChartCard
          title="Recent Expenses"
          action={<Link to="/app/expenses" className="text-xs font-semibold text-brand-500 hover:underline">View all <ArrowRight className="inline h-3 w-3" /></Link>}
        >
          {expenses.length ? (
            <ExpenseTable expenses={expenses.slice(0, 5)} currency={currency} />
          ) : (
            <EmptyState
              icon={Receipt}
              title="No expenses yet"
              description="Add your first expense to monitor spending."
              action={
                <Link to="/app/expenses" className="btn-primary">
                  <Plus className="h-4 w-4" /> Add an expense
                </Link>
              }
            />
          )}
        </ChartCard>
      </div>
    </Page>
  );
}
