export default function LoadingSpinner({ size = 'md', label, fullscreen = false }) {
  const dim = size === 'lg' ? 'h-10 w-10' : size === 'sm' ? 'h-4 w-4' : 'h-6 w-6';
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${dim} animate-spin rounded-full border-2 border-slate-300 border-t-brand-500 dark:border-white/15 dark:border-t-brand-400`}
      />
      {label && <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>}
    </div>
  );
  if (fullscreen) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 dark:bg-navy-950">{spinner}</div>
    );
  }
  return <div className="grid place-items-center py-10">{spinner}</div>;
}
