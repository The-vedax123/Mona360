import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient.js';

const AuthContext = createContext(null);

const LOCAL_USERS_KEY = 'bb_users';
const LOCAL_SESSION_KEY = 'bb_session';

function readLocalUsers() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeLocalUsers(users) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function toPublicUser(u) {
  return { id: u.id, email: u.email, full_name: u.full_name, created_at: u.created_at, demo: !!u.demo };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function init() {
      if (isSupabaseConfigured) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (active && session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || session.user.email,
            created_at: session.user.created_at,
          });
        }
        supabase.auth.onAuthStateChange((_event, s) => {
          if (s?.user) {
            setUser({
              id: s.user.id,
              email: s.user.email,
              full_name: s.user.user_metadata?.full_name || s.user.email,
              created_at: s.user.created_at,
            });
          } else {
            setUser(null);
          }
        });
      } else {
        const raw = localStorage.getItem(LOCAL_SESSION_KEY);
        if (active && raw) {
          try {
            setUser(JSON.parse(raw));
          } catch {
            /* ignore */
          }
        }
      }
      if (active) setLoading(false);
    }
    init();
    return () => {
      active = false;
    };
  }, []);

  const signUp = useCallback(async ({ email, password, fullName }) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email, full_name: fullName, created_at: data.user.created_at });
      }
      return data.user;
    }
    // Local mode
    const users = readLocalUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }
    const newUser = {
      id: `usr_${Math.random().toString(36).slice(2, 12)}`,
      email,
      password,
      full_name: fullName || email.split('@')[0],
      created_at: new Date().toISOString(),
    };
    writeLocalUsers([...users, newUser]);
    const publicUser = toPublicUser(newUser);
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(publicUser));
    setUser(publicUser);
    return publicUser;
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data.user;
    }
    const users = readLocalUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found || found.password !== password) {
      throw new Error('Invalid email or password.');
    }
    const publicUser = toPublicUser(found);
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(publicUser));
    setUser(publicUser);
    return publicUser;
  }, []);

  /** One-tap demo account — always available, even without Supabase. */
  const signInDemo = useCallback(async () => {
    const demoUser = {
      id: 'usr_demo_newton',
      email: 'demo@businessbrain.ai',
      full_name: 'Newton Banda',
      created_at: new Date().toISOString(),
      demo: true,
    };
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(demoUser));
    setUser(demoUser);
    return demoUser;
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LOCAL_SESSION_KEY);
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isSupabaseConfigured,
    signUp,
    signIn,
    signInDemo,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
