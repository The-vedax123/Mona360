import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Wallet, ArrowRight, LogOut, Check } from 'lucide-react';
import { useBusiness } from '../hooks/useBusiness.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { generateWalletAddress } from '../utils/blockchain.js';
import { truncateMiddle } from '../utils/format.js';
import Logo from '../components/ui/Logo.jsx';

const CURRENCIES = ['ZMW', 'USD', 'NGN', 'KES', 'ZAR', 'GBP', 'EUR'];
const TYPES = [
  'Retail & General Trading',
  'Food & Beverage',
  'Services',
  'Wholesale',
  'Manufacturing',
  'Agriculture',
  'Technology',
  'Other',
];

export default function CreateBusiness() {
  const { createBusiness } = useBusiness();
  const { user, signOut } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    business_name: '',
    owner_name: user?.full_name || '',
    business_type: TYPES[0],
    country: '',
    city: '',
    currency: 'ZMW',
  });
  const [wallet, setWallet] = useState(null);
  const [seed, setSeed] = useState(true);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    createBusiness({ ...form, wallet_address: wallet }, { seedSampleData: seed });
    toast.success('Business profile created!');
    setTimeout(() => navigate('/app'), 300);
  };

  const connectWallet = () => {
    const addr = generateWalletAddress();
    setWallet(addr);
    toast.success('Wallet connected — your business identity is now portable');
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-navy-950">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <Logo />
          <button onClick={signOut} className="btn-ghost text-sm text-slate-500">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>

        <div className="card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-500/15 text-brand-500">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Create your business profile</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                This powers your dashboard, AI insights and business passport.
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label">Business name</label>
              <input required value={form.business_name} onChange={set('business_name')} placeholder="BrightMart Supplies" className="input" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Owner name</label>
                <input required value={form.owner_name} onChange={set('owner_name')} placeholder="Newton Banda" className="input" />
              </div>
              <div>
                <label className="label">Business type</label>
                <select value={form.business_type} onChange={set('business_type')} className="input">
                  {TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label">Country</label>
                <input required value={form.country} onChange={set('country')} placeholder="Zambia" className="input" />
              </div>
              <div>
                <label className="label">City</label>
                <input required value={form.city} onChange={set('city')} placeholder="Lusaka" className="input" />
              </div>
              <div>
                <label className="label">Currency</label>
                <select value={form.currency} onChange={set('currency')} className="input">
                  {CURRENCIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="button" onClick={connectWallet} className="btn-secondary w-full">
              <Wallet className="h-4 w-4 text-accent-500" />
              {wallet ? `Wallet linked · ${truncateMiddle(wallet)}` : 'Link a business wallet (optional)'}
            </button>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-white/10">
              <span
                className={`grid h-5 w-5 place-items-center rounded-md border transition ${
                  seed ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300 dark:border-white/20'
                }`}
              >
                {seed && <Check className="h-3.5 w-3.5" />}
              </span>
              <input type="checkbox" checked={seed} onChange={(e) => setSeed(e.target.checked)} className="sr-only" />
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Prefill with sample data so I can preview the full dashboard immediately
              </span>
            </label>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating…' : 'Create business & continue'} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
