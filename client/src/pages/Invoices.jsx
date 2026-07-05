import { useMemo, useState } from 'react';
import { Plus, FileText, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import Page from '../components/ui/Page.jsx';
import StatCard from '../components/StatCard.jsx';
import InvoiceCard from '../components/InvoiceCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/ui/Modal.jsx';
import { useBusiness } from '../hooks/useBusiness.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { generateInvoiceHash } from '../utils/blockchain.js';
import { formatCurrency } from '../utils/format.js';

export default function Invoices() {
  const { business, invoices, addRecord, updateRecord } = useBusiness();
  const toast = useToast();
  const currency = business?.currency || 'ZMW';

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const emptyForm = { customer_name: '', customer_contact: '', item_description: '', quantity: '1', unit_price: '', due_date: '', status: 'pending' };
  const [form, setForm] = useState(emptyForm);

  const nextNumber = useMemo(() => {
    const nums = invoices
      .map((i) => Number((i.invoice_number || '').replace(/\D/g, '')))
      .filter((n) => !Number.isNaN(n));
    const max = nums.length ? Math.max(...nums) : 1000;
    return `INV-${max + 1}`;
  }, [invoices]);

  const filtered = filter === 'all' ? invoices : invoices.filter((i) => i.status === filter);

  const totals = useMemo(() => {
    const paid = invoices.filter((i) => i.status === 'paid');
    const outstanding = invoices.filter((i) => i.status !== 'paid');
    return {
      total: invoices.reduce((s, i) => s + Number(i.total_amount || 0), 0),
      paid: paid.reduce((s, i) => s + Number(i.total_amount || 0), 0),
      outstanding: outstanding.reduce((s, i) => s + Number(i.total_amount || 0), 0),
      paidCount: paid.length,
    };
  }, [invoices]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const total = (Number(form.quantity) || 0) * (Number(form.unit_price) || 0);

  const submit = (e) => {
    e.preventDefault();
    if (!form.customer_name || !form.unit_price) {
      toast.warning('Customer name and unit price are required');
      return;
    }
    addRecord('invoices', {
      invoice_number: nextNumber,
      customer_name: form.customer_name,
      customer_contact: form.customer_contact,
      item_description: form.item_description,
      quantity: Number(form.quantity) || 1,
      unit_price: Number(form.unit_price),
      total_amount: total,
      status: form.status,
      due_date: form.due_date || null,
      invoice_hash: generateInvoiceHash(),
    });
    toast.success(`Invoice ${nextNumber} created & verified`);
    setForm(emptyForm);
    setOpen(false);
  };

  const markPaid = (id) => {
    updateRecord('invoices', id, { status: 'paid' });
    toast.success('Invoice marked as paid');
  };

  const copyHash = async (hash) => {
    try {
      await navigator.clipboard.writeText(hash);
      toast.success('Verification hash copied');
    } catch {
      toast.info(hash);
    }
  };

  const FILTERS = ['all', 'pending', 'paid', 'overdue'];

  return (
    <Page
      title="Invoices"
      subtitle="Create verifiable invoices with blockchain-backed proof."
      action={
        <button onClick={() => setOpen(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> New Invoice
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Invoiced" value={formatCurrency(totals.total, currency)} icon={FileText} tone="brand" hint={`${invoices.length} invoices`} />
        <StatCard label="Paid" value={formatCurrency(totals.paid, currency)} icon={CheckCircle2} tone="emerald" hint={`${totals.paidCount} settled`} />
        <StatCard label="Outstanding" value={formatCurrency(totals.outstanding, currency)} icon={Clock} tone="amber" />
        <StatCard label="Verified" value="100%" icon={ShieldCheck} tone="accent" hint="all records hashed" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`chip capitalize ${
              filter === f ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((inv) => (
            <InvoiceCard key={inv.id} invoice={inv} currency={currency} onMarkPaid={markPaid} onCopyHash={copyHash} />
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState
            icon={FileText}
            title="No invoices here"
            description="Create your first invoice — it will be verified with a unique hash."
            action={<button onClick={() => setOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> New Invoice</button>}
          />
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create invoice"
        description={`Invoice number ${nextNumber} · auto-verified on save`}
        footer={
          <>
            <button onClick={() => setOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={submit} className="btn-primary">Create & verify</button>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Customer name</label>
              <input value={form.customer_name} onChange={set('customer_name')} placeholder="Lusaka Grocers Ltd" className="input" required />
            </div>
            <div>
              <label className="label">Email or phone</label>
              <input value={form.customer_contact} onChange={set('customer_contact')} placeholder="accounts@company.com" className="input" />
            </div>
          </div>
          <div>
            <label className="label">Item description</label>
            <input value={form.item_description} onChange={set('item_description')} placeholder="Bulk Cooking Oil (20 units)" className="input" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Quantity</label>
              <input type="number" min="1" value={form.quantity} onChange={set('quantity')} className="input" />
            </div>
            <div>
              <label className="label">Unit price</label>
              <input type="number" min="0" step="0.01" value={form.unit_price} onChange={set('unit_price')} placeholder="820" className="input" required />
            </div>
            <div>
              <label className="label">Due date</label>
              <input type="date" value={form.due_date} onChange={set('due_date')} className="input" />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-brand-500/10 px-4 py-3">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Total</span>
            <span className="text-lg font-extrabold text-brand-600 dark:text-brand-300">{formatCurrency(total, currency)}</span>
          </div>
        </form>
      </Modal>
    </Page>
  );
}
