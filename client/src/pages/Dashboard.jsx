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
  const { business, sales, expenses, inventory, invoices, walletTransactions } = useBusiness();
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

  return (
    <Page
      title={`${greeting()}, ${business?.owner_name?.split(' ')[0] || 'there'} 👋`}
      subtitle="Here's what's happening in your business today."
      action={
        <Link to="/app/advisor" className="btn-primary hidden sm:inline-flex">
          <Sparkles className="h-4 w-4" /> Ask Mona AI
        </Link>
      }
    >
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
              <p className="font-bold capitalize text-slate-900 dark:text-white">{metrics.risk.level}</p>
            </div>
          </div>
          <Badge tone={metrics.risk.level === 'high' ? 'red' : metrics.risk.level === 'medium' ? 'amber' : 'emerald'}>
            {metrics.risk.lowCount} low
          </Badge>
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
            <EmptyState title="No sales yet" description="Record your first sale to get started." />
          )}
        </ChartCard>

        <ChartCard
          title="Recent Expenses"
          action={<Link to="/app/expenses" className="text-xs font-semibold text-brand-500 hover:underline">View all <ArrowRight className="inline h-3 w-3" /></Link>}
        >
          {expenses.length ? (
            <ExpenseTable expenses={expenses.slice(0, 5)} currency={currency} />
          ) : (
            <EmptyState title="No expenses yet" description="Track your first expense to monitor costs." />
          )}
        </ChartCard>
      </div>
    </Page>
  );
}
