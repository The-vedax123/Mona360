import { Trash2, CreditCard } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/format.js';
import Badge from './ui/Badge.jsx';

const PAYMENT_TONE = {
  Cash: 'emerald',
  'Mobile Money': 'brand',
  Card: 'accent',
  Bank: 'amber',
};

export default function SalesTable({ sales = [], currency = 'ZMW', onDelete }) {
  return (
    <div className="overflow-hidden">
      {/* Desktop table */}
      <table className="hidden w-full text-sm md:table">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
            <th className="pb-3 font-semibold">Product / Service</th>
            <th className="pb-3 font-semibold">Customer</th>
            <th className="pb-3 font-semibold">Payment</th>
            <th className="pb-3 font-semibold">Date</th>
            <th className="pb-3 text-right font-semibold">Amount</th>
            {onDelete && <th className="pb-3" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
          {sales.map((s) => (
            <tr key={s.id} className="group">
              <td className="py-3 font-medium text-slate-900 dark:text-white">{s.product_name}</td>
              <td className="py-3 text-slate-600 dark:text-slate-300">{s.customer_name || '—'}</td>
              <td className="py-3">
                <Badge tone={PAYMENT_TONE[s.payment_method] || 'slate'} icon={CreditCard}>
                  {s.payment_method || '—'}
                </Badge>
              </td>
              <td className="py-3 text-slate-500 dark:text-slate-400">{formatDate(s.sale_date)}</td>
              <td className="py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(s.amount, currency)}
              </td>
              {onDelete && (
                <td className="py-3 pl-2 text-right">
                  <button
                    onClick={() => onDelete(s.id)}
                    className="rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"
                    aria-label="Delete sale"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="space-y-2 md:hidden">
        {sales.map((s) => (
          <div key={s.id} className="rounded-xl border border-slate-100 p-3 dark:border-white/5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 dark:text-white">{s.product_name}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(s.amount, currency)}
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{s.customer_name || '—'}</span>
              <span>{formatDate(s.sale_date)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <Badge tone={PAYMENT_TONE[s.payment_method] || 'slate'}>{s.payment_method || '—'}</Badge>
              {onDelete && (
                <button
                  onClick={() => onDelete(s.id)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-red-500"
                  aria-label="Delete sale"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
