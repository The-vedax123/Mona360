import { useTheme } from './useTheme.jsx';

/** Recharts styling that adapts to light/dark mode. */
export function useChartTheme() {
  const { isDark } = useTheme();
  return {
    axis: isDark ? '#94a3b8' : '#64748b',
    grid: isDark ? 'rgba(148,163,184,0.15)' : 'rgba(100,116,139,0.15)',
    cursor: isDark ? 'rgba(148,163,184,0.08)' : 'rgba(100,116,139,0.08)',
    tooltip: {
      background: isDark ? '#131a2f' : '#ffffff',
      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '12px',
      color: isDark ? '#e2e8f0' : '#0f172a',
      boxShadow: '0 10px 30px -12px rgba(2,6,23,0.25)',
    },
  };
}
