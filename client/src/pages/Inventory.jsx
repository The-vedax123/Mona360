import { useMemo, useState } from 'react';
import { Plus, Boxes, AlertTriangle, TrendingUp, PackageX } from 'lucide-react';
import Page from '../components/ui/Page.jsx';
import StatCard from '../components/StatCard.jsx';
import InventoryTable from '../components/InventoryTable.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/ui/Modal.jsx';
import AIInsightCard from '../components/AIInsightCard.jsx';
import { useBusiness } from '../hooks/useBusiness.jsx';
import { useToast } from '../hooks/useToast.jsx';
import {
  lowStockProducts,
  deadStockProducts,
  highProfitItems,
  inventoryValue,
} from '../utils/calculations.js';
import { formatCurrency } from '../utils/format.js';

const CATEGORIES = ['Groceries', 'Staples', 'Household', 'Beverages', 'Electronics', 'Other'];

export default function Inventory() {
  const { business, inventory, sales, addRecord, updateRecord } = useBusiness();
  const toast = useToast();
  const currency = business?.currency || 'ZMW';

  const [open, setOpen] = useState(false);
  const emptyForm = { product_name: '', category: 'Groceries', quantity: '', buying_price: '', selling_price: '', reorder_level: '' };
  const [form, setForm] = useState(emptyForm);

  const low = lowStockProducts(inventory);
  const dead = deadStockProducts(inventory, sales);
  const topProfit = highProfitItems(inventory).slice(0, 1)[0];
  const value = inventoryValue(inventory);

  const aiFlags = useMemo(() => {
    const flags = [];
    if (low.length)
      flags.push({ id: 'low', insight_type: 'inventory', priority: 'high', title: 'Restock needed', message: `${low.map((i) => i.product_name).join(', ')} ${low.length === 1 ? 'is' : 'are'} at or below reorder level.` });
    if (dead.length)
      flags.push({ id: 'dead', insight_type: 'inventory', priority: 'medium', title: 'Dead stock', message: `${dead.map((i) => i.product_name).join(', ')} ${dead.length === 1 ? 'has' : 'have'} no recent sales. Consider a promotion.` });
    if (topProfit && topProfit.unitProfit > 0)
      flags.push({ id: 'profit', insight_type: 'growth', priority: 'low', title: 'High-profit item', message: `${topProfit.product_name} has your best unit margin (${topProfit.margin.toFixed(0)}%). Keep it stocked and promote it.` });
    return flags;
  }, [low, dead, topProfit]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (!form.product_name) {
      toast.warning('Product name is required');
      return;
    }
    addRecord('inventory', {
      ...form,
      quantity: Number(form.quantity) || 0,
      buying_price: Number(form.buying_price) || 0,
      selling_price: Number(form.selling_price) || 0,
      reorder_level: Number(form.reorder_level) || 0,
    });
    toast.success('Inventory item added');
    setForm(emptyForm);
    setOpen(false);
  };

  const adjust = (id, delta) => {
    const item = inventory.find((i) => i.id === id);
    if (!item) return;
    const next = Math.max(0, Number(item.quantity) + delta);
    updateRecord('inventory', id, { quantity: next });
  };

  return (
    <Page
      title="Inventory"
      subtitle="Monitor stock levels with AI intelligence."
      action={
        <button onClick={() => setOpen(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Item
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Stock Value" value={formatCurrency(value, currency)} icon={Boxes} tone="brand" hint={`${inventory.length} products`} />
        <StatCard label="Low Stock" value={low.length} icon={AlertTriangle} tone={low.length ? 'red' : 'emerald'} hint="below reorder level" />
        <StatCard label="Dead Stock" value={dead.length} icon={PackageX} tone={dead.length ? 'amber' : 'emerald'} hint="no recent sales" />
        <StatCard label="Top Margin" value={topProfit?.product_name || '—'} icon={TrendingUp} tone="emerald" hint={topProfit ? `${topProfit.margin.toFixed(0)}%` : ''} />
      </div>

      {aiFlags.length > 0 && (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {aiFlags.map((f) => (
            <AIInsightCard key={f.id} insight={f} />
          ))}
        </div>
      )}

      <div className="card mt-4 p-4">
        <h3 className="section-title mb-4">Stock Levels</h3>
        {inventory.length ? (
          <InventoryTable inventory={inventory} currency={currency} onAdjust={adjust} />
        ) : (
          <EmptyState
            icon={Boxes}
            title="No inventory yet"
            description="Add products to track stock and get restock alerts."
            action={<button onClick={() => setOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add Item</button>}
          />
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add inventory item"
        footer={
          <>
            <button onClick={() => setOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={submit} className="btn-primary">Save item</button>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Product name</label>
              <input value={form.product_name} onChange={set('product_name')} placeholder="Cooking Oil" className="input" required />
            </div>
            <div>
              <label className="label">Category</label>
              <select value={form.category} onChange={set('category')} className="input">
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Quantity</label>
              <input type="number" min="0" value={form.quantity} onChange={set('quantity')} placeholder="14" className="input" />
            </div>
            <div>
              <label className="label">Reorder level</label>
              <input type="number" min="0" value={form.reorder_level} onChange={set('reorder_level')} placeholder="10" className="input" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Buying price ({currency})</label>
              <input type="number" min="0" step="0.01" value={form.buying_price} onChange={set('buying_price')} placeholder="620" className="input" />
            </div>
            <div>
              <label className="label">Selling price ({currency})</label>
              <input type="number" min="0" step="0.01" value={form.selling_price} onChange={set('selling_price')} placeholder="850" className="input" />
            </div>
          </div>
        </form>
      </Modal>
    </Page>
  );
}
