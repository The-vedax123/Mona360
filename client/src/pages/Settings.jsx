import { useState } from 'react';
import { Building2, Palette, Bell, Wallet, Save, Trash2, Sun, Moon, LogOut, RefreshCw } from 'lucide-react';
import Page from '../components/ui/Page.jsx';
import Badge from '../components/ui/Badge.jsx';
import { useBusiness } from '../hooks/useBusiness.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { useTheme } from '../hooks/useTheme.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { truncateMiddle } from '../utils/format.js';
import { generateWalletAddress } from '../utils/blockchain.js';

const CURRENCIES = ['ZMW', 'USD', 'NGN', 'KES', 'ZAR', 'GBP', 'EUR'];

export default function Settings() {
  const { business, updateBusiness, connectWallet, disconnectWallet, resetData } = useBusiness();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const toast = useToast();

  const [form, setForm] = useState({
    business_name: business?.business_name || '',
    owner_name: business?.owner_name || '',
    business_type: business?.business_type || '',
    city: business?.city || '',
    country: business?.country || '',
    currency: business?.currency || 'ZMW',
  });
  const [notifs, setNotifs] = useState({ lowStock: true, invoices: true, aiInsights: true, weekly: false });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const saveProfile = (e) => {
    e.preventDefault();
    updateBusiness(form);
    toast.success('Business profile updated');
  };

  return (
    <Page title="Settings" subtitle="Manage your business, preferences and wallet.">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Business profile */}
        <form onSubmit={saveProfile} className="card p-5">
          <SectionHeader icon={Building2} title="Business Profile" />
          <div className="mt-4 space-y-4">
            <div>
              <label className="label">Business name</label>
              <input value={form.business_name} onChange={set('business_name')} className="input" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Owner name</label>
                <input value={form.owner_name} onChange={set('owner_name')} className="input" />
              </div>
              <div>
                <label className="label">Business type</label>
                <input value={form.business_type} onChange={set('business_type')} className="input" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label">City</label>
                <input value={form.city} onChange={set('city')} className="input" />
              </div>
              <div>
                <label className="label">Country</label>
                <input value={form.country} onChange={set('country')} className="input" />
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
            <button type="submit" className="btn-primary">
              <Save className="h-4 w-4" /> Save changes
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {/* Owner / account */}
          <div className="card p-5">
            <SectionHeader icon={Building2} title="Owner Details" />
            <div className="mt-4 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-lg font-bold text-white">
                {(business?.owner_name || 'U').charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{business?.owner_name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Theme */}
          <div className="card p-5">
            <SectionHeader icon={Palette} title="Theme" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { key: 'light', label: 'Light', icon: Sun },
                { key: 'dark', label: 'Dark', icon: Moon },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTheme(t.key)}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition ${
                    theme === t.key
                      ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-300'
                      : 'border-slate-200 text-slate-500 dark:border-white/10 dark:text-slate-400'
                  }`}
                >
                  <t.icon className="h-4 w-4" /> {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Wallet */}
          <div className="card p-5">
            <SectionHeader icon={Wallet} title="Wallet Settings" />
            <div className="mt-4">
              {business?.wallet_address ? (
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-white/5">
                  <div>
                    <p className="font-mono text-sm text-slate-700 dark:text-slate-200">{truncateMiddle(business.wallet_address, 10, 8)}</p>
                    <Badge tone="emerald" className="mt-1">Connected</Badge>
                  </div>
                  <button onClick={() => { disconnectWallet(); toast.info('Wallet disconnected'); }} className="btn-secondary text-xs">
                    Disconnect
                  </button>
                </div>
              ) : (
                <button onClick={() => { connectWallet(generateWalletAddress()); toast.success('Wallet connected'); }} className="btn-secondary w-full">
                  <Wallet className="h-4 w-4" /> Connect wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card mt-4 p-5">
        <SectionHeader icon={Bell} title="Notification Preferences" />
        <div className="mt-4 divide-y divide-slate-100 dark:divide-white/5">
          {[
            ['lowStock', 'Low stock alerts', 'Get notified when a product drops below its reorder level'],
            ['invoices', 'Invoice reminders', 'Reminders for pending and overdue invoices'],
            ['aiInsights', 'AI insights', 'New AI recommendations about your business'],
            ['weekly', 'Weekly summary', 'A weekly performance digest emailed to you'],
          ].map(([key, title, desc]) => (
            <div key={key} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-200">{title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
              </div>
              <Toggle on={notifs[key]} onClick={() => setNotifs((n) => ({ ...n, [key]: !n[key] }))} />
            </div>
          ))}
        </div>
      </div>

      {/* Danger / data */}
      <div className="card mt-4 p-5">
        <SectionHeader icon={Trash2} title="Data & Account" />
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => { resetData(); toast.success('Data reset'); }}
            className="btn-secondary"
          >
            <RefreshCw className="h-4 w-4" /> Reset demo data
          </button>
          <button onClick={signOut} className="btn-secondary text-red-500">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>
    </Page>
  );
}

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500/15 text-brand-500">
        <Icon className="h-4 w-4" />
      </span>
      <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
    </div>
  );
}

function Toggle({ on, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative h-6 w-11 rounded-full transition ${on ? 'bg-brand-500' : 'bg-slate-300 dark:bg-white/15'}`}
      aria-pressed={on}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );
}
