import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Plus,
  LogOut,
  ChevronDown,
  Moon,
  Sun,
  TrendingUp,
  Receipt,
  Boxes,
  FileText,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme.jsx';
import { useBusiness } from '../hooks/useBusiness.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { useLayout } from '../hooks/useLayout.jsx';
import { NAV_ITEMS } from './navConfig.js';
import Badge from './ui/Badge.jsx';

export default function Header({ title, subtitle, action }) {
  const { business } = useBusiness();
  const { toggleMobile, toggleCollapsed } = useLayout();

  const onHamburger = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) toggleCollapsed();
    else toggleMobile();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-cream-50/70 backdrop-blur-xl dark:border-white/10 dark:bg-navy-950/80">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <button
          onClick={onHamburger}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-white dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-extrabold text-slate-900 dark:text-white sm:text-xl">{title}</h1>
            {business?.verification_status === 'verified' && (
              <Badge tone="emerald" className="hidden sm:inline-flex">Verified</Badge>
            )}
          </div>
          {subtitle && <p className="hidden truncate text-sm text-slate-500 dark:text-slate-400 sm:block">{subtitle}</p>}
        </div>

        {/* Search */}
        <div className="relative hidden max-w-xs flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search anything..."
            className="w-full rounded-full border border-slate-200 bg-white/80 py-2 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {action}
          <button
            className="relative hidden h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-white dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10 sm:grid"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
              3
            </span>
          </button>
          {!action && (
            <div className="hidden md:block">
              <AddMenu />
            </div>
          )}
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}

function AddMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const items = [
    { label: 'Add Sale', icon: TrendingUp, to: '/app/sales' },
    { label: 'Add Expense', icon: Receipt, to: '/app/expenses' },
    { label: 'Add Inventory', icon: Boxes, to: '/app/inventory' },
    { label: 'New Invoice', icon: FileText, to: '/app/invoices' },
  ];

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="btn-primary rounded-full px-4">
        <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add</span>
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-48 animate-fade-in overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-card dark:border-white/10 dark:bg-navy-800">
          {items.map((it) => (
            <button
              key={it.label}
              onClick={() => {
                setOpen(false);
                navigate(it.to);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
            >
              <it.icon className="h-4 w-4 text-brand-500" /> {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AccountMenu() {
  const { user, signOut } = useAuth();
  const { business } = useBusiness();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const initial = (business?.owner_name || user?.full_name || 'U').charAt(0).toUpperCase();

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    toast.success('Signed out');
    navigate('/login');
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-full border border-slate-200 py-1 pl-1 pr-1.5 transition hover:bg-white dark:border-white/10 dark:hover:bg-white/10"
        aria-label="Account menu"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-sm font-bold text-white">
          {initial}
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-64 animate-fade-in overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-white/10 dark:bg-navy-800">
          <div className="flex items-center gap-3 border-b border-slate-100 p-3 dark:border-white/5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-sm font-bold text-white">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {business?.owner_name || user?.full_name || 'Account'}
              </p>
              <p className="truncate text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto p-1.5 lg:hidden">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="p-1.5">
            <button
              onClick={toggleTheme}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {isDark ? 'Light mode' : 'Dark mode'}
            </button>
          </div>

          <div className="border-t border-slate-100 p-1.5 dark:border-white/5">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
