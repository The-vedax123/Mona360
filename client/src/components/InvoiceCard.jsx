import { ShieldCheck, Clock, Copy, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate, truncateMiddle } from '../utils/format.js';
import Badge from './ui/Badge.jsx';

const STATUS_TONE = {
  paid: 'emerald',
  pending: 'amber',
  overdue: 'red',
  draft: 'slate',
};

export default function InvoiceCard({ invoice, currency = 'ZMW', onMarkPaid, onCopyHash }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{invoice.invoice_number}</p>
          <h3 className="mt-0.5 font-bold text-slate-900 dark:text-white">{invoice.customer_name}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{invoice.customer_contact}</p>
        </div>
        <Badge tone={STATUS_TONE[invoice.status] || 'slate'} className="capitalize">
          {invoice.status}
        </Badge>
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm dark:bg-white/5">
        <p className="text-slate-700 dark:text-slate-200">{invoice.item_description}</p>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            {invoice.quantity} × {formatCurrency(invoice.unit_price, currency)}
          </span>
          <span>Due {formatDate(invoice.due_date)}</span>
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-xs text-slate-400">Total</p>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(invoice.total_amount, currency)}
          </p>
        </div>
        {invoice.status !== 'paid' && onMarkPaid && (
          <button onClick={() => onMarkPaid(invoice.id)} className="btn-primary text-xs">
            <CheckCircle2 className="h-4 w-4" /> Mark as paid
          </button>
        )}
      </div>

      {/* Blockchain-inspired verification */}
      <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" /> Verified record
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="h-3 w-3" /> {formatDate(invoice.created_at)}
          </span>
        </div>
        <button
          onClick={() => onCopyHash?.(invoice.invoice_hash)}
          className="mt-2 flex w-full items-center justify-between gap-2 rounded-lg bg-white/60 px-2.5 py-1.5 font-mono text-[11px] text-slate-600 transition hover:bg-white dark:bg-black/20 dark:text-slate-300"
          title="Copy verification hash"
        >
          <span className="truncate">{truncateMiddle(invoice.invoice_hash, 14, 8)}</span>
          <Copy className="h-3.5 w-3.5 shrink-0" />
        </button>
      </div>
    </div>
  );
}
