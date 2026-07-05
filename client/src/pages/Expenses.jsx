import { useMemo, useState } from 'react';
import { Plus, Receipt, PieChart, Layers } from 'lucide-react';
import Page from '../components/ui/Page.jsx';
import StatCard from '../components/StatCard.jsx';
import ExpenseTable from '../components/ExpenseTable.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/ui/Modal.jsx';
import { useBusiness } from '../hooks/useBusiness.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { totalExpenses, highestExpenseCategory } from '../utils/calculations.js';
import { formatCurrency } from '../utils/format.js';

const CATEGORIES = ['Rent', 'Transport', 'Utilities', 'Inventory', 'Marketing', 'Salaries', 'Other'];

export default function Expenses() {
  const { business, expenses, addRecord, deleteRecord } = useBusiness();
  const toast = useToast();
  const currency = business?.currency || 'ZMW';

  const [open, setOpen] = useState(false);
  const emptyForm = { title: '', category: 'Rent', amount: '', expense_date: new Date().toISOString().slice(0, 10), notes: '' };
  const [form, setForm] = useState(emptyForm);

  const total = totalExpenses(expenses);
  const topCategory = highestExpenseCategory(expenses);
  const categoryCount = useMemo(() => new Set(expenses.map((e) => e.category)).size, [expenses]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) {
      toast.warning('Title and amount are required');
      return;
    }
    addRecord('expenses', { ...form, amount: Number(form.amount) });
    toast.success('Expense added');
    setForm(emptyForm);
    setOpen(false);
  };

  return (
    <Page
      title="Expenses"
      subtitle="Track where your money goes."
      action={
        <button onClick={() => setOpen(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Expense
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Expenses" value={formatCurrency(total, currency)} icon={Receipt} tone="red" hint={`${expenses.length} records`} />
        <StatCard label="Highest Category" value={topCategory || '—'} icon={PieChart} tone="amber" />
        <StatCard label="Categories" value={categoryCount} icon={Layers} tone="brand" />
      </div>

      <div className="card mt-4 p-4">
        <h3 className="section-title mb-4">Expense History</h3>
        {expenses.length ? (
          <ExpenseTable expenses={expenses} currency={currency} onDelete={(id) => { deleteRecord('expenses', id); toast.info('Expense removed'); }} />
        ) : (
          <EmptyState
            icon={Receipt}
            title="No expenses yet"
            description="Add your first expense to monitor spending."
            action={<button onClick={() => setOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add Expense</button>}
          />
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add an expense"
        footer={
          <>
            <button onClick={() => setOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={submit} className="btn-primary">Save expense</button>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Expense title</label>
            <input value={form.title} onChange={set('title')} placeholder="Shop Rent" className="input" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Category</label>
              <select value={form.category} onChange={set('category')} className="input">
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Amount ({currency})</label>
              <input type="number" min="0" step="0.01" value={form.amount} onChange={set('amount')} placeholder="2500" className="input" required />
            </div>
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" value={form.expense_date} onChange={set('expense_date')} className="input" />
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
