import { Minus, Plus, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../utils/format.js';
import Badge from './ui/Badge.jsx';

export default function InventoryTable({ inventory = [], currency = 'ZMW', onAdjust }) {
  const rows = inventory.map((i) => {
    const low = Number(i.quantity) <= Number(i.reorder_level);
    const margin = i.selling_price ? ((i.selling_price - i.buying_price) / i.selling_price) * 100 : 0;
    return { ...i, low, margin };
  });

  return (
    <div>
      <table className="hidden w-full text-sm lg:table">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
            <th className="pb-3 font-semibold">Product</th>
            <th className="pb-3 font-semibold">Category</th>
            <th className="pb-3 text-center font-semibold">Stock</th>
            <th className="pb-3 text-right font-semibold">Buy</th>
            <th className="pb-3 text-right font-semibold">Sell</th>
            <th className="pb-3 text-right font-semibold">Margin</th>
            <th className="pb-3 text-center font-semibold">Status</th>
            {onAdjust && <th className="pb-3 text-center font-semibold">Adjust</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
          {rows.map((i) => (
            <tr key={i.id}>
              <td className="py-3 font-medium text-slate-900 dark:text-white">{i.product_name}</td>
              <td className="py-3 text-slate-500 dark:text-slate-400">{i.category}</td>
              <td className="py-3 text-center font-bold text-slate-900 dark:text-white">{i.quantity}</td>
              <td className="py-3 text-right text-slate-500 dark:text-slate-400">
                {formatCurrency(i.buying_price, currency)}
              </td>
              <td className="py-3 text-right text-slate-700 dark:text-slate-200">
                {formatCurrency(i.selling_price, currency)}
              </td>
              <td className="py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                {i.margin.toFixed(0)}%
              </td>
              <td className="py-3 text-center">
                {i.low ? (
                  <Badge tone="red" icon={AlertTriangle}>
                    Low
                  </Badge>
                ) : (
                  <Badge tone="emerald">In stock</Badge>
                )}
              </td>
              {onAdjust && (
                <td className="py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onAdjust(i.id, -1)}
                      className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10"
                      aria-label="Decrease stock"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onAdjust(i.id, 1)}
                      className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10"
                      aria-label="Increase stock"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid gap-2 lg:hidden">
        {rows.map((i) => (
          <div key={i.id} className="rounded-xl border border-slate-100 p-3 dark:border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{i.product_name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{i.category}</p>
              </div>
              {i.low ? (
                <Badge tone="red" icon={AlertTriangle}>
                  Low stock
                </Badge>
              ) : (
                <Badge tone="emerald">In stock</Badge>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-500 dark:text-slate-400">Qty</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">{i.quantity}</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400">{i.margin.toFixed(0)}% margin</span>
              </div>
              {onAdjust && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onAdjust(i.id, -1)}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 dark:border-white/10"
                    aria-label="Decrease stock"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onAdjust(i.id, 1)}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 dark:border-white/10"
                    aria-label="Increase stock"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
