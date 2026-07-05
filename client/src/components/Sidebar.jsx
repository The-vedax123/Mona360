import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, ChevronsLeft, ChevronsRight, ChevronUp, Settings as SettingsIcon, X, PartyPopper } from 'lucide-react';
import { NAV_ITEMS } from './navConfig.js';
import Logo from './ui/Logo.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { useBusiness } from '../hooks/useBusiness.jsx';
import { useLayout } from '../hooks/useLayout.jsx';
import { useToast } from '../hooks/useToast.jsx';

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const { business } = useBusiness();
  const { collapsed, toggleCollapsed, mobileOpen, closeMobile } = useLayout();
  const toast = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onClick = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false);
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  const initial = (business?.owner_name || user?.full_name || 'U').charAt(0).toUpperCase();

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    toast.success('Signed out');
    navigate('/login');
  };

  const showText = !collapsed; // labels hidden on desktop rail when collapsed

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200/80 bg-white/90 backdrop-blur-xl transition-transform duration-300 dark:border-white/10 dark:bg-navy-900/80 lg:static lg:z-auto lg:translate-x-0 lg:transition-[width] ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      } ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}
    >
      {/* Brand + collapse */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className={collapsed ? 'lg:hidden' : ''}>
          <Logo />
        </div>
        {collapsed && (
          <div className="hidden w-full justify-center lg:flex">
            <Logo withText={false} />
          </div>
        )}
        <button
          onClick={toggleCollapsed}
          className="hidden h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10 lg:grid"
          aria-label="Collapse sidebar"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
        <button
          onClick={closeMobile}
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={closeMobile}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                collapsed ? 'lg:justify-center lg:px-0' : ''
              } ${
                isActive
                  ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-glow'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white'
              }`
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span className={collapsed ? 'lg:hidden' : ''}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Motivational card */}
      {showText && (
        <div className="mx-3 mb-3 hidden rounded-2xl border border-amber-300/40 bg-gradient-to-br from-amber-50 to-cream-100 p-3.5 dark:border-amber-500/20 dark:from-amber-500/10 dark:to-transparent lg:block">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-300">
            <PartyPopper className="h-4 w-4" /> You&apos;re doing great!
          </div>
          <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-200/70">
            Keep tracking your business and growing.
          </p>
        </div>
      )}

      {/* User card */}
      <div className="relative border-t border-slate-200/80 p-3 dark:border-white/10" ref={menuRef}>
        {menuOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card dark:border-white/10 dark:bg-navy-800">
            <NavLink
              to="/app/settings"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
            >
              <SettingsIcon className="h-4 w-4" /> Settings
            </NavLink>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        )}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className={`flex w-full items-center gap-3 rounded-xl p-2 transition hover:bg-slate-100 dark:hover:bg-white/5 ${
            collapsed ? 'lg:justify-center' : ''
          }`}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-sm font-bold text-white">
            {initial}
          </span>
          <div className={`min-w-0 flex-1 text-left ${collapsed ? 'lg:hidden' : ''}`}>
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
              {business?.owner_name || user?.full_name || 'Account'}
            </p>
            <p className="truncate text-xs text-slate-400">Business Owner</p>
          </div>
          <ChevronUp className={`h-4 w-4 text-slate-400 transition ${collapsed ? 'lg:hidden' : ''} ${menuOpen ? '' : 'rotate-180'}`} />
        </button>
      </div>
    </aside>
  );
}
