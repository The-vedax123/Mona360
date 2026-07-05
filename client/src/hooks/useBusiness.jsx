import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from './useAuth.jsx';
import { buildDemoState } from '../data/demoData.js';
import { generateWalletAddress } from '../utils/blockchain.js';

const BusinessContext = createContext(null);

const dataKey = (userId) => `bb_data_${userId}`;

const EMPTY_STATE = {
  business: null,
  sales: [],
  expenses: [],
  inventory: [],
  invoices: [],
  walletTransactions: [],
};

function loadState(userId) {
  try {
    const raw = localStorage.getItem(dataKey(userId));
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return null;
}

const uid = (p) => `${p}_${Math.random().toString(36).slice(2, 10)}`;
const now = () => new Date().toISOString();
const today = () => now().slice(0, 10);

export function BusinessProvider({ children }) {
  const { user } = useAuth();
  const [state, setState] = useState(EMPTY_STATE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) {
      setState(EMPTY_STATE);
      setReady(false);
      return;
    }
    const existing = loadState(user.id);
    if (existing) {
      setState({ ...EMPTY_STATE, ...existing });
    } else if (user.demo) {
      // Demo account is seeded with the full BrightMart Supplies dataset.
      setState({ ...EMPTY_STATE, ...buildDemoState() });
    } else {
      setState(EMPTY_STATE);
    }
    setReady(true);
  }, [user]);

  // Persist on every change (local demo persistence).
  useEffect(() => {
    if (user && ready) {
      localStorage.setItem(dataKey(user.id), JSON.stringify(state));
    }
  }, [state, user, ready]);

  const createBusiness = useCallback(
    (profile, { seedSampleData = false } = {}) => {
      const business = {
        id: uid('biz'),
        business_name: profile.business_name,
        owner_name: profile.owner_name,
        business_type: profile.business_type,
        country: profile.country,
        city: profile.city,
        currency: profile.currency || 'ZMW',
        wallet_address: profile.wallet_address || null,
        verification_status: profile.wallet_address ? 'verified' : 'pending',
        created_at: now(),
      };
      if (seedSampleData) {
        const demo = buildDemoState();
        setState({
          business: { ...demo.business, ...business },
          sales: demo.sales,
          expenses: demo.expenses,
          inventory: demo.inventory,
          invoices: demo.invoices,
          walletTransactions: demo.walletTransactions,
        });
      } else {
        setState((prev) => ({ ...prev, business }));
      }
      return business;
    },
    []
  );

  const updateBusiness = useCallback((patch) => {
    setState((prev) => ({ ...prev, business: { ...prev.business, ...patch } }));
  }, []);

  const connectWallet = useCallback((address) => {
    const walletAddress = address || generateWalletAddress();
    setState((prev) => ({
      ...prev,
      business: prev.business
        ? { ...prev.business, wallet_address: walletAddress, verification_status: 'verified' }
        : prev.business,
    }));
    return walletAddress;
  }, []);

  const disconnectWallet = useCallback(() => {
    setState((prev) => ({
      ...prev,
      business: prev.business ? { ...prev.business, wallet_address: null } : prev.business,
    }));
  }, []);

  // Generic CRUD on a collection ------------------------------------------
  const addRecord = useCallback((collection, record) => {
    const item = { id: uid(collection.slice(0, 3)), created_at: now(), ...record };
    setState((prev) => ({ ...prev, [collection]: [item, ...(prev[collection] || [])] }));
    return item;
  }, []);

  const updateRecord = useCallback((collection, id, patch) => {
    setState((prev) => ({
      ...prev,
      [collection]: prev[collection].map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
  }, []);

  const deleteRecord = useCallback((collection, id) => {
    setState((prev) => ({ ...prev, [collection]: prev[collection].filter((r) => r.id !== id) }));
  }, []);

  const resetData = useCallback(() => {
    if (user?.demo) setState({ ...EMPTY_STATE, ...buildDemoState() });
    else setState((prev) => ({ ...EMPTY_STATE, business: prev.business }));
  }, [user]);

  const value = useMemo(
    () => ({
      ...state,
      ready,
      hasBusiness: !!state.business,
      createBusiness,
      updateBusiness,
      connectWallet,
      disconnectWallet,
      addRecord,
      updateRecord,
      deleteRecord,
      resetData,
      helpers: { uid, now, today },
    }),
    [state, ready, createBusiness, updateBusiness, connectWallet, disconnectWallet, addRecord, updateRecord, deleteRecord, resetData]
  );

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export function useBusiness() {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error('useBusiness must be used within BusinessProvider');
  return ctx;
}
