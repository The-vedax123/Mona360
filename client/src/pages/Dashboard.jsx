import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  Receipt,
  Wallet,
  PiggyBank,
  Rocket,
  Plus,
  AlertTriangle,
  ShoppingCart,
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  Package,
  CheckCircle2,
  Trophy,
} from 'lucide-react';
import Page from '../components/ui/Page.jsx';
import StatCard from '../components/StatCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useBusiness } from '../hooks/useBusiness.jsx';
import { useToast } from '../hooks/useToast.jsx';
import {
  totalRevenue,
  totalExpenses,
  netProfit,
  profitMargin,
  lowStockProducts,
  buildTrend,
} from '../utils/calculations.js';
import { formatCurrency, formatDate, formatRelative } from '../utils/format.js';
import { useChartTheme } from '../hooks/useChartTheme.js';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function periodTrend(buckets) {
  const half = Math.floor(buckets.length / 2);
  const prev = buckets.slice(0, half);
  const recent = buckets.slice(half);
  const sum = (arr, k) => arr.reduce((s, b) => s + b[k], 0);
  const calc = (k) => {
    const p = sum(prev, k);
    const r = sum(recent, k);
    if (p <= 0) return null;
    return ((r - p) / p) * 100;
  };
  return { revenue: calc('revenue'), expenses: calc('expenses'), profit: calc('profit') };
}

export default function Dashboard() {
  const { business, sales, expenses, inventory, walletTransactions, isEmpty, loadDemoData } = useBusiness();
  const toast = useToast();
  const chart = useChartTheme();
  const currency = business?.currency || 'ZMW';
  const [days, setDays] = useState(7);

  const revenue = totalRevenue(sales);
  const exp = totalExpenses(expenses);
  const profit = netProfit(sales, expenses);
  const margin = profitMargin(sales, expenses);

  const trend = useMemo(() => buildTrend(sales, expenses, days), [sales, expenses, days]);
  const badges = useMemo(() => periodTrend(buildTrend(sales, expenses, 14)), [sales, expenses]);
  const low = lowStockProducts(inventory);

  const walletBalance = walletTransactions.reduce(
    (sum, t) => sum + (t.transaction_type === 'received' ? Number(t.amount) : -Number(t.amount)),
    0
  );

  const highestSale = useMemo(
    () => sales.reduce((max, s) => (Number(s.amount) > Number(max?.amount || 0) ? s : max), null),
    [sales]
  );
  const highestExpense = useMemo(
    () => expenses.reduce((max, e) => (Number(e.amount) > Number(max?.amount || 0) ? e : max), null),
    [expenses]
  );

  const topProducts = useMemo(() => {
    const totals = {};
    for (const s of sales) totals[s.product_name] = (totals[s.product_name] || 0) + Number(s.amount || 0);
    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [sales]);
  const topMax = topProducts[0]?.value || 1;

  const activity = useMemo(() => {
    const items = [
      ...sales.map((s) => ({ id: s.id, type: 'sale', title: `Sale recorded`, detail: `${formatCurrency(s.amount, currency)} · ${s.product_name}`, at: s.created_at || s.sale_date })),
      ...expenses.map((e) => ({ id: e.id, type: 'expense', title: `Expense: ${e.title}`, detail: `${formatCurrency(e.amount, currency)} · ${e.category}`, at: e.created_at || e.expense_date })),
      ...walletTransactions.map((t) => ({ id: t.id, type: t.transaction_type === 'received' ? 'received' : 'sent', title: t.transaction_type === 'received' ? 'Payment received' : 'Payment sent', detail: formatCurrency(t.amount, currency), at: t.created_at })),
    ];
    return items.sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 6);
  }, [sales, expenses, walletTransactions, currency]);

  const handleLoadDemo = () => {
    loadDemoData();
    toast.success('Demo business loaded — explore the full dashboard.');
  };

  const firstName = business?.owner_name?.split(' ')[0] || 'there';

  return (
    <Page
      title={`${greeting()}, ${firstName}! 👋`}
      subtitle="Here's what's happening with your business today."
      action={
        isEmpty ? (
          <button onClick={handleLoadDemo} className="btn-primary hidden rounded-full sm:inline-flex">
            <Rocket className="h-4 w-4" /> Load Demo Business
          </button>
        ) : null
      }
    >
      {isEmpty && (
        <div className="card mb-4 flex flex-col gap-4 border-brand-500/30 bg-gradient-to-br from-brand-500/10 to-accent-500/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-500/15 text-brand-600">
              <Rocket className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Your business is ready to build</h3>
              <p className="mt-0.5 max-w-xl text-sm text-slate-500 dark:text-slate-400">
                Add your first sale, expense or inventory item — everything updates in real time. Just
                presenting? Load an optional demo business to preview it all.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Link to="/app/sales" className="btn-secondary rounded-full">
              <Plus className="h-4 w-4" /> Add a sale
            </Link>
            <button onClick={handleLoadDemo} className="btn-primary rounded-full">
              <Rocket className="h-4 w-4" /> Load Demo Business
            </button>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Revenue" value={formatCurrency(revenue, currency)} icon={TrendingUp} tone="emerald" hint={`${sales.length} sales`} trend={badges.revenue} />
        <StatCard label="Total Expenses" value={formatCurrency(exp, currency)} icon={Receipt} tone="orange" hint={`${expenses.length} recorded`} trend={badges.expenses} />
        <StatCard label="Net Profit" value={formatCurrency(profit, currency)} icon={PiggyBank} tone="blue" hint={`${margin.toFixed(1)}% margin`} trend={badges.profit} />
        <StatCard label="Wallet Balance" value={formatCurrency(walletBalance, currency)} icon={Wallet} tone="violet" hint="Mona360 Wallet" />
      </div>

      {/* Overview + Inventory */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Business Overview */}
        <div className="card p-5 shadow-soft lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Business Overview</h3>
              <div className="mt-1 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-brand-500" /> Revenue</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Expenses</span>
              </div>
            </div>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-400/30 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
            </select>
          </div>

          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={trend} margin={{ left: -18, right: 8, top: 4 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} width={48} />
              <Tooltip contentStyle={chart.tooltip} formatter={(v) => formatCurrency(v, currency)} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#22c55e" strokeWidth={2.5} fill="url(#rev)" dot={false} />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f97316" strokeWidth={2.5} fill="url(#exp)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <MiniStat icon={TrendingUp} tone="emerald" label="Highest Sale" value={highestSale ? formatCurrency(highestSale.amount, currency) : formatCurrency(0, currency)} sub={highestSale ? formatDate(highestSale.sale_date) : '—'} />
            <MiniStat icon={ArrowUpRight} tone="orange" label="Highest Expense" value={highestExpense ? formatCurrency(highestExpense.amount, currency) : formatCurrency(0, currency)} sub={highestExpense ? formatDate(highestExpense.expense_date) : '—'} />
            <MiniStat icon={PiggyBank} tone="blue" label="Profit Margin" value={`${margin.toFixed(1)}%`} sub="This month" />
          </div>
        </div>

        {/* Inventory Status */}
        <div className="card p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">Inventory Status</h3>
            <Link to="/app/inventory" className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">View all</Link>
          </div>

          {inventory.length === 0 ? (
            <EmptyState icon={Boxes} title="No items yet" description="Add inventory items to detect stock risks." />
          ) : low.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl bg-emerald-500/10 p-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">All stocked up</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">No products are below their reorder level.</p>
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-start gap-2.5 rounded-xl bg-amber-500/10 p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <div>
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                    {low.length} item{low.length > 1 ? 's are' : ' is'} running low
                  </p>
                  <p className="text-xs text-amber-700/70 dark:text-amber-200/60">Take action to restock and avoid stockouts.</p>
                </div>
              </div>
              <div className="space-y-2">
                {low.slice(0, 4).map((i) => (
                  <div key={i.id} className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500 dark:bg-white/5">
                      <Package className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">{i.product_name}</p>
                      <p className="text-xs text-slate-400">Reorder soon</p>
                    </div>
                    <span className="text-sm font-bold text-red-500">{i.quantity} left</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Top Products + Recent Activity */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="card p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">Top Products</h3>
            <Link to="/app/sales" className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">View all</Link>
          </div>
          {topProducts.length ? (
            <div className="space-y-3.5">
              {topProducts.map((p, i) => (
                <div key={p.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                      <span className="grid h-5 w-5 place-items-center rounded-md bg-brand-500/15 text-[11px] font-bold text-brand-600 dark:text-brand-400">{i + 1}</span>
                      {p.name}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(p.value, currency)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500" style={{ width: `${(p.value / topMax) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Trophy} title="No sales yet" description="Add your first sale to start tracking revenue." />
          )}
        </div>

        <div className="card p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">Recent Activity</h3>
            <Link to="/app/sales" className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">View all</Link>
          </div>
          {activity.length ? (
            <div className="space-y-1">
              {activity.map((a) => (
                <ActivityRow key={`${a.type}-${a.id}`} item={a} />
              ))}
            </div>
          ) : (
            <EmptyState icon={ShoppingCart} title="No activity yet" description="Your latest sales, expenses and payments appear here." />
          )}
        </div>
      </div>
    </Page>
  );
}

const MINI_TONES = {
  emerald: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  orange: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  blue: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
};

function MiniStat({ icon: Icon, tone, label, value, sub }) {
  return (
    <div className="rounded-xl border border-slate-100 p-3 dark:border-white/5">
      <div className="flex items-center gap-2">
        <span className={`grid h-7 w-7 place-items-center rounded-lg ${MINI_TONES[tone]}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <p className="mt-2 text-base font-extrabold text-slate-900 dark:text-white">{value}</p>
      <p className="text-[11px] text-slate-400">{sub}</p>
    </div>
  );
}

const ACT_META = {
  sale: { icon: ShoppingCart, tone: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  expense: { icon: Receipt, tone: 'bg-orange-500/15 text-orange-600 dark:text-orange-400' },
  received: { icon: ArrowDownLeft, tone: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
  sent: { icon: ArrowUpRight, tone: 'bg-violet-500/15 text-violet-600 dark:text-violet-400' },
};

function ActivityRow({ item }) {
  const meta = ACT_META[item.type] || ACT_META.sale;
  const Icon = meta.icon;
  return (
    <div className="flex items-center gap-3 rounded-xl px-1 py-2">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${meta.tone}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">{item.title}</p>
        <p className="truncate text-xs text-slate-400">{item.detail}</p>
      </div>
      <span className="shrink-0 text-xs text-slate-400">{formatRelative(item.at)}</span>
    </div>
  );
}
