import { Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/format.js';
import Badge from './ui/Badge.jsx';

const CATEGORY_TONE = {
  Rent: 'brand',
  Transport: 'accent',
  Utilities: 'amber',
  Inventory: 'emerald',
  Marketing: 'red',
  Salaries: 'brand',
  Other: 'slate',
};

export default function ExpenseTable({ expenses = [], currency = 'ZMW', onDelete }) {
  return (
    <div>
      <table className="hidden w-full text-sm md:table">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
            <th className="pb-3 font-semibold">Expense</th>
            <th className="pb-3 font-semibold">Category</th>
            <th className="pb-3 font-semibold">Date</th>
            <th className="pb-3 text-right font-semibold">Amount</th>
            {onDelete && <th className="pb-3" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
          {expenses.map((e) => (
            <tr key={e.id} className="group">
              <td className="py-3 font-medium text-slate-900 dark:text-white">{e.title}</td>
              <td className="py-3">
                <Badge tone={CATEGORY_TONE[e.category] || 'slate'}>{e.category || 'Other'}</Badge>
              </td>
              <td className="py-3 text-slate-500 dark:text-slate-400">{formatDate(e.expense_date)}</td>
              <td className="py-3 text-right font-bold text-red-500">-{formatCurrency(e.amount, currency)}</td>
              {onDelete && (
                <td className="py-3 pl-2 text-right">
                  <button
                    onClick={() => onDelete(e.id)}
                    className="rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"
                    aria-label="Delete expense"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-2 md:hidden">
        {expenses.map((e) => (
          <div key={e.id} className="rounded-xl border border-slate-100 p-3 dark:border-white/5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 dark:text-white">{e.title}</span>
              <span className="font-bold text-red-500">-{formatCurrency(e.amount, currency)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <Badge tone={CATEGORY_TONE[e.category] || 'slate'}>{e.category || 'Other'}</Badge>
              <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(e.expense_date)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
