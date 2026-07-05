import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { AuthShell } from './Login.jsx';
import Logo from '../components/ui/Logo.jsx';

export default function Signup() {
  const { signUp, signInDemo, isSupabaseConfigured } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.warning('Password should be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await signUp(form);
      if (isSupabaseConfigured) {
        toast.success('Account created! Check your email to confirm, then continue.');
      } else {
        toast.success('Account created!');
      }
      navigate('/onboarding');
    } catch (err) {
      toast.error(err.message || 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  const demo = async () => {
    await signInDemo();
    navigate('/app');
  };

  return (
    <AuthShell>
      <div className="mb-6 flex justify-center lg:hidden">
        <Logo />
      </div>
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Create your account</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Start monitoring your business in minutes — free.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="label">Full name</label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Newton Banda"
              className="input pl-10"
            />
          </div>
        </div>
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
              placeholder="At least 6 characters"
              className="input pl-10"
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating…' : 'Create account'} <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" /> or <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
      </div>

      <button onClick={demo} className="btn-secondary w-full">
        <Sparkles className="h-4 w-4 text-brand-500" /> Explore the demo business
      </button>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-500 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
