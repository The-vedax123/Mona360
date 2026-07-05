import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import MobileBottomNav from '../components/MobileBottomNav.jsx';
import { LayoutProvider, useLayout } from '../hooks/useLayout.jsx';

function LayoutShell() {
  const { mobileOpen, closeMobile } = useLayout();
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={closeMobile} aria-hidden />
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <main className="flex-1 pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}

export default function AppLayout() {
  return (
    <LayoutProvider>
      <LayoutShell />
    </LayoutProvider>
  );
}
