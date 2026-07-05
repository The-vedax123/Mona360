import { useMemo } from 'react';
import { Users, Crown, Repeat, ShoppingBag } from 'lucide-react';
import Page from '../components/ui/Page.jsx';
import StatCard from '../components/StatCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Badge from '../components/ui/Badge.jsx';
import { useBusiness } from '../hooks/useBusiness.jsx';
import { formatCurrency, formatDate } from '../utils/format.js';

export default function Customers() {
  const { business, sales } = useBusiness();
  const currency = business?.currency || 'ZMW';

  const customers = useMemo(() => {
    const map = {};
    for (const s of sales) {
      const name = (s.customer_name || 'Walk-in customer').trim() || 'Walk-in customer';
      if (!map[name]) map[name] = { name, total: 0, orders: 0, last: null, products: {} };
      const c = map[name];
      c.total += Number(s.amount || 0);
      c.orders += 1;
      const d = s.sale_date || s.created_at;
      if (!c.last || new Date(d) > new Date(c.last)) c.last = d;
      c.products[s.product_name] = (c.products[s.product_name] || 0) + Number(s.amount || 0);
    }
    return Object.values(map)
      .map((c) => ({
        ...c,
        avg: c.orders ? c.total / c.orders : 0,
        favourite: Object.entries(c.products).sort((a, b) => b[1] - a[1])[0]?.[0] || '—',
      }))
      .sort((a, b) => b.total - a.total);
  }, [sales]);

  const totalCustomers = customers.length;
  const repeat = customers.filter((c) => c.orders > 1).length;
  const topCustomer = customers[0];

  return (
    <Page title="Customers" subtitle="Understand who buys from you and how often.">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Customers" value={totalCustomers} icon={Users} tone="brand" hint="from recorded sales" />
        <StatCard label="Repeat Customers" value={repeat} icon={Repeat} tone="blue" hint="more than one order" />
        <StatCard label="Top Customer" value={topCustomer?.name || '—'} icon={Crown} tone="violet" colorValue={false} hint={topCustomer ? formatCurrency(topCustomer.total, currency) : ''} />
      </div>

      <div className="card mt-4 p-4 shadow-soft sm:p-5">
        <h3 className="section-title mb-4">Customer Directory</h3>
        {customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers yet"
            description="Record sales with a customer name to build your customer directory automatically."
          />
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden w-full text-sm md:table">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Favourite</th>
                  <th className="pb-3 text-center font-semibold">Orders</th>
                  <th className="pb-3 text-right font-semibold">Avg order</th>
                  <th className="pb-3 font-semibold">Last order</th>
                  <th className="pb-3 text-right font-semibold">Total spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {customers.map((c) => (
                  <tr key={c.name}>
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-xs font-bold text-white">
                          {c.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="font-medium text-slate-900 dark:text-white">{c.name}</span>
                        {c.orders > 1 && <Badge tone="blue">Repeat</Badge>}
                      </div>
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{c.favourite}</td>
                    <td className="py-3 text-center font-semibold text-slate-700 dark:text-slate-200">{c.orders}</td>
                    <td className="py-3 text-right text-slate-500 dark:text-slate-400">{formatCurrency(c.avg, currency)}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{formatDate(c.last)}</td>
                    <td className="py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(c.total, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="space-y-2 md:hidden">
              {customers.map((c) => (
                <div key={c.name} className="rounded-xl border border-slate-100 p-3 dark:border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-sm font-bold text-white">
                        {c.name.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.orders} order{c.orders > 1 ? 's' : ''} · {c.favourite}</p>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(c.total, currency)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="card mt-4 flex items-start gap-3 p-4 text-sm text-slate-500 dark:text-slate-400">
        <ShoppingBag className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
        Customer insights are built automatically from your sales. Add a customer name when recording a sale to
        track their spending, favourite products and repeat purchases.
      </div>
    </Page>
  );
}
