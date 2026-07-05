import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Wallet, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { generateWalletAddress } from '../utils/blockchain.js';
import { truncateMiddle } from '../utils/format.js';
import Logo from '../components/ui/Logo.jsx';

export default function Login() {
  const { signIn, signInDemo, isSupabaseConfigured } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(form);
      toast.success('Welcome back!');
      navigate('/app');
    } catch (err) {
      toast.error(err.message || 'Could not sign in');
    } finally {
      setLoading(false);
    }
  };

  const demo = async () => {
    setLoading(true);
    try {
      await signInDemo();
      toast.success('Logged in to the demo business');
      navigate('/app');
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = () => {
    const addr = generateWalletAddress();
    setWallet(addr);
    toast.success(`Wallet connected · ${truncateMiddle(addr)}`);
  };

  return (
    <AuthShell>
      <div className="mb-6 flex justify-center lg:hidden">
        <Logo />
      </div>
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Sign in to monitor your business and get AI insights.
      </p>

      {!isSupabaseConfigured && (
        <div className="mt-4 rounded-xl border border-brand-500/30 bg-brand-500/10 p-3 text-xs text-brand-600 dark:text-brand-300">
          Running in <b>local demo mode</b> (no Supabase keys set). Just enter <b>any email &amp; password</b> and tap
          Sign in — your account is created on this device automatically. Or tap <b>Try the demo business</b> for an
          instant pre-loaded business.
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="label">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@business.com"
              className="input pl-10"
            />
          </div>
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="input pl-10"
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Signing in…' : 'Sign in'} <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" /> or <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
      </div>

      <div className="space-y-2.5">
        <button onClick={demo} disabled={loading} className="btn-secondary w-full">
          <Sparkles className="h-4 w-4 text-brand-500" /> Try the demo business
        </button>
        <button onClick={connectWallet} className="btn-secondary w-full">
          <Wallet className="h-4 w-4 text-accent-500" />
          {wallet ? `Wallet connected · ${truncateMiddle(wallet)}` : 'Connect wallet (optional)'}
        </button>
        <p className="text-center text-[11px] text-slate-400">
          Wallet connection is optional — you can use everything without Web3.
        </p>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        New here?{' '}
        <Link to="/signup" className="font-semibold text-brand-500 hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-navy-950">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-accent-600 p-10 text-white lg:flex">
        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 -left-16 h-72 w-72 rounded-full bg-black/10 blur-3xl" />
        <Link to="/" className="relative w-fit rounded-xl transition hover:opacity-90">
          <Logo />
        </Link>
        <div className="relative max-w-md">
          <h2 className="text-3xl font-extrabold leading-tight">
            See Everything. Decide Better.
          </h2>
          <p className="mt-4 text-white/80">
            One beautiful dashboard for sales, expenses, inventory, invoices, cash flow and a
            blockchain-backed Mona360 Passport — with Mona AI watching your back.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {[
              ['Mona', 'AI'],
              ['Web3', 'Trust'],
              ['360°', 'Monitoring'],
            ].map(([a, b]) => (
              <div key={b} className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-2xl font-extrabold">{a}</p>
                <p className="text-xs text-white/70">{b}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-sm text-white/60">© {new Date().getFullYear()} Mona360</p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col px-5 py-6 lg:w-1/2">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md py-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
