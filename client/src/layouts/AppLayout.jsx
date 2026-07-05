import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import MobileBottomNav from '../components/MobileBottomNav.jsx';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-navy-950">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <main className="flex-1 pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
