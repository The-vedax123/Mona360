import {
  LayoutDashboard,
  Sparkles,
  TrendingUp,
  Receipt,
  Boxes,
  FileText,
  Wallet,
  BadgeCheck,
  BarChart3,
  Users,
  Settings,
} from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/advisor', label: 'Mona AI', icon: Sparkles },
  { to: '/app/sales', label: 'Sales', icon: TrendingUp },
  { to: '/app/expenses', label: 'Expenses', icon: Receipt },
  { to: '/app/inventory', label: 'Inventory', icon: Boxes },
  { to: '/app/invoices', label: 'Invoices', icon: FileText },
  { to: '/app/wallet', label: 'Wallet', icon: Wallet },
  { to: '/app/passport', label: 'Passport', icon: BadgeCheck },
  { to: '/app/reports', label: 'Insights', icon: BarChart3 },
  { to: '/app/customers', label: 'Customers', icon: Users },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

// A trimmed set for the mobile bottom bar (5 primary destinations).
export const MOBILE_NAV_ITEMS = [
  { to: '/app', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/app/advisor', label: 'Mona AI', icon: Sparkles },
  { to: '/app/sales', label: 'Sales', icon: TrendingUp },
  { to: '/app/wallet', label: 'Wallet', icon: Wallet },
  { to: '/app/passport', label: 'Passport', icon: BadgeCheck },
];
