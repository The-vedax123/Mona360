const TONES = {
  emerald: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  brand: 'bg-brand-500/15 text-brand-600 dark:text-brand-300',
  amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  red: 'bg-red-500/15 text-red-600 dark:text-red-400',
  slate: 'bg-slate-500/15 text-slate-600 dark:text-slate-300',
  accent: 'bg-accent-500/15 text-accent-600 dark:text-accent-400',
};

export default function Badge({ tone = 'slate', children, className = '', icon: Icon }) {
  return (
    <span className={`chip ${TONES[tone] || TONES.slate} ${className}`}>
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </span>
  );
}
