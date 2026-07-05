import { createContext, useContext, useState, useCallback } from 'react';

const LayoutContext = createContext(null);

export function LayoutProvider({ children }) {
  const [collapsed, setCollapsed] = useState(false); // desktop rail
  const [mobileOpen, setMobileOpen] = useState(false); // mobile drawer

  const toggleCollapsed = useCallback(() => setCollapsed((c) => !c), []);
  const toggleMobile = useCallback(() => setMobileOpen((o) => !o), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <LayoutContext.Provider
      value={{ collapsed, setCollapsed, toggleCollapsed, mobileOpen, setMobileOpen, toggleMobile, closeMobile }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayout must be used within LayoutProvider');
  return ctx;
}
