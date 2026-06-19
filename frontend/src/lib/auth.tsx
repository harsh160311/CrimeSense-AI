'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_BASE = 'http://localhost:8000/api';

interface AuthUser {
  name: string;
  badge: string;
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const name = localStorage.getItem('auth_name');
    const badge = localStorage.getItem('auth_badge');
    if (token && name && badge) {
      fetch(`${API_BASE}/auth/verify`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(10000),
      }).then(r => {
        if (r.ok) setUser({ token, name, badge });
        else { localStorage.clear(); setUser(null); }
      }).catch(() => {
        setUser({ token, name, badge });
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error('Invalid credentials');
    const data = await res.json();
    const authUser = { token: data.token, name: data.name, badge: data.badge };
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_name', data.name);
    localStorage.setItem('auth_badge', data.badge);
    setUser(authUser);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
