import { useMemo, useState } from 'react';
import { Plus, TrendingUp, Trophy, ShoppingCart } from 'lucide-react';
import Page from '../components/ui/Page.jsx';
import StatCard from '../components/StatCard.jsx';
import SalesTable from '../components/SalesTable.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/ui/Modal.jsx';
import { useBusiness } from '../hooks/useBusiness.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { totalRevenue, bestSellingProduct } from '../utils/calculations.js';
import { formatCurrency } from '../utils/format.js';

const PAYMENT_METHODS = ['Cash', 'Mobile Money', 'Card', 'Bank'];

export default function Sales() {
  const { business, sales, addRecord, deleteRecord } = useBusiness();
  const toast = useToast();
  const currency = business?.currency || 'ZMW';

  const [open, setOpen] = useState(false);
  const [range, setRange] = useState({ from: '', to: '' });
  const emptyForm = { product_name: '', customer_name: '', amount: '', payment_method: 'Cash', sale_date: new Date().toISOString().slice(0, 10), notes: '' };
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    return sales.filter((s) => {
      const d = (s.sale_date || '').slice(0, 10);
      if (range.from && d < range.from) return false;
      if (range.to && d > range.to) return false;
      return true;
    });
  }, [sales, range]);

  const revenue = totalRevenue(filtered);
  const best = bestSellingProduct(filtered);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (!form.product_name || !form.amount) {
      toast.warning('Product name and amount are required');
      return;
    }
    addRecord('sales', { ...form, amount: Number(form.amount) });
    toast.success('Sale recorded');
    setForm(emptyForm);
    setOpen(false);
  };

  const remove = (id) => {
    deleteRecord('sales', id);
    toast.info('Sale removed');
  };

  return (
    <Page
      title="Sales"
      subtitle="Record and monitor every sale."
      action={
        <button onClick={() => setOpen(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Sale
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Sales" value={formatCurrency(revenue, currency)} icon={TrendingUp} tone="emerald" hint={`${filtered.length} transactions`} />
        <StatCard label="Best Seller" value={best || '—'} icon={Trophy} tone="amber" />
        <StatCard label="Transactions" value={filtered.length} icon={ShoppingCart} tone="brand" />
      </div>

      <div className="card mt-4 p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h3 className="section-title">Sales History</h3>
          <div className="flex items-end gap-2">
            <div>
              <label className="label">From</label>
              <input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">To</label>
              <input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} className="input" />
            </div>
            {(range.from || range.to) && (
              <button onClick={() => setRange({ from: '', to: '' })} className="btn-ghost text-xs">
                Clear
              </button>
            )}
          </div>
        </div>

        {filtered.length ? (
          <SalesTable sales={filtered} currency={currency} onDelete={remove} />
        ) : (
          <EmptyState
            icon={ShoppingCart}
            title="No sales found"
            description="Add your first sale to start tracking revenue."
            action={<button onClick={() => setOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add Sale</button>}
          />
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add a sale"
        description="Record a new sale for your business."
        footer={
          <>
            <button onClick={() => setOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={submit} className="btn-primary">Save sale</button>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Product / Service</label>
              <input value={form.product_name} onChange={set('product_name')} placeholder="Cooking Oil" className="input" required />
            </div>
            <div>
              <label className="label">Customer name</label>
              <input value={form.customer_name} onChange={set('customer_name')} placeholder="Grace Phiri" className="input" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Amount ({currency})</label>
              <input type="number" min="0" step="0.01" value={form.amount} onChange={set('amount')} placeholder="850" className="input" required />
            </div>
            <div>
              <label className="label">Payment method</label>
              <select value={form.payment_method} onChange={set('payment_method')} className="input">
                {PAYMENT_METHODS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" value={form.sale_date} onChange={set('sale_date')} className="input" />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea value={form.notes} onChange={set('notes')} rows={2} placeholder="Optional" className="input" />
          </div>
        </form>
      </Modal>
    </Page>
  );
}
