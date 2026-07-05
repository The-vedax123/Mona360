import { Moon, Sun, Bell } from 'lucide-react';
import { useTheme } from '../hooks/useTheme.jsx';
import { useBusiness } from '../hooks/useBusiness.jsx';
import Logo from './ui/Logo.jsx';
import Badge from './ui/Badge.jsx';

export default function Header({ title, subtitle, action }) {
  const { isDark, toggleTheme } = useTheme();
  const { business } = useBusiness();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50/80 backdrop-blur-xl dark:border-white/10 dark:bg-navy-950/80">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <div className="lg:hidden">
            <Logo size="sm" />
          </div>
          <div className="hidden lg:block">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-xl font-extrabold text-slate-900 dark:text-white">{title}</h1>
              {business?.verification_status === 'verified' && (
                <Badge tone="emerald">Verified</Badge>
              )}
            </div>
            {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {action}
          <button
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-brand-500" />
          </button>
          <button
            onClick={toggleTheme}
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile page title row */}
      <div className="px-4 pb-3 lg:hidden">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
    </header>
  );
}
