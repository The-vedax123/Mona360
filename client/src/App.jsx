import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.jsx';
import { useBusiness } from './hooks/useBusiness.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import AppLayout from './layouts/AppLayout.jsx';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import CreateBusiness from './pages/CreateBusiness.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AIAdvisor from './pages/AIAdvisor.jsx';
import Sales from './pages/Sales.jsx';
import Expenses from './pages/Expenses.jsx';
import Inventory from './pages/Inventory.jsx';
import Invoices from './pages/Invoices.jsx';
import Wallet from './pages/Wallet.jsx';
import BusinessPassport from './pages/BusinessPassport.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';
import NotFound from './pages/NotFound.jsx';

function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const { hasBusiness, ready } = useBusiness();
  const location = useLocation();

  if (loading) return <LoadingSpinner fullscreen label="Loading BusinessBrain AI…" />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (ready && !hasBusiness) return <Navigate to="/onboarding" replace />;
  return children;
}

function RequireNoBusiness({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const { hasBusiness, ready } = useBusiness();
  if (loading) return <LoadingSpinner fullscreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (ready && hasBusiness) return <Navigate to="/app" replace />;
  return children;
}

function PublicOnly({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner fullscreen />;
  if (isAuthenticated) return <Navigate to="/app" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          <PublicOnly>
            <Login />
          </PublicOnly>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnly>
            <Signup />
          </PublicOnly>
        }
      />
      <Route
        path="/onboarding"
        element={
          <RequireNoBusiness>
            <CreateBusiness />
          </RequireNoBusiness>
        }
      />

      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="advisor" element={<AIAdvisor />} />
        <Route path="sales" element={<Sales />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="passport" element={<BusinessPassport />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
