import { LineChart } from 'lucide-react';

export default function Logo({ size = 'md', withText = true }) {
  const dim = size === 'lg' ? 'h-11 w-11' : size === 'sm' ? 'h-8 w-8' : 'h-9 w-9';
  const text = size === 'lg' ? 'text-2xl' : 'text-lg';
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`grid ${dim} place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-glow`}
      >
        <LineChart className="h-1/2 w-1/2" strokeWidth={2.5} />
      </div>
      {withText && (
        <span className={`font-extrabold tracking-tight text-slate-900 dark:text-white ${text}`}>
          Mona<span className="text-brand-600 dark:text-brand-400">360</span>
        </span>
      )}
    </div>
  );
}
