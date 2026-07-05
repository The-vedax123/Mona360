import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { NAV_ITEMS } from './navConfig.js';
import Logo from './ui/Logo.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { useBusiness } from '../hooks/useBusiness.jsx';

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const { business } = useBusiness();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-navy-900/60 lg:flex">
      <div className="px-5 py-5">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-gradient-to-r from-brand-500/15 to-accent-500/10 text-brand-600 dark:text-brand-300'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`h-5 w-5 ${isActive ? 'text-brand-500' : ''}`} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3 dark:border-white/10">
        <div className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-sm font-bold text-white">
            {(business?.owner_name || user?.full_name || 'U').charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
              {business?.owner_name || user?.full_name}
            </p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>
        <button onClick={signOut} className="btn-ghost w-full justify-start text-red-500 hover:bg-red-500/10">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </aside>
  );
}
