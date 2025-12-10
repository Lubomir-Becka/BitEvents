import React, { useState, useMemo, useCallback, type ReactNode } from 'react';
import { AuthContext, type User } from './AuthContextDef';

// Bezpečná funkcia na parsovanie JSON z localStorage
const safeJsonParse = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

// Kontrola či je token expired (ak má JWT štruktúru)
const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const payload = token.split('.')[1];
    if (!payload) return false; // Nie je JWT, predpokladáme že je validný
    const decoded = JSON.parse(atob(payload));
    if (decoded.exp) {
      return decoded.exp * 1000 < Date.now();
    }
    return false;
  } catch {
    return false; // Ak sa nedá parsovať, predpokladáme že je validný
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedToken = localStorage.getItem('authToken');
    if (isTokenExpired(storedToken)) {
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      return null;
    }
    return safeJsonParse<User | null>(localStorage.getItem('user'), null);
  });

  const [token, setToken] = useState<string | null>(() => {
    const storedToken = localStorage.getItem('authToken');
    if (isTokenExpired(storedToken)) {
      return null;
    }
    return storedToken;
  });

  const login = useCallback((newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('authToken', newToken);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  }, []);

  const isAuthenticated = !!token && !!user && !isTokenExpired(token);

  const contextValue = useMemo(
    () => ({ user, token, login, logout, isAuthenticated }),
    [user, token, login, logout, isAuthenticated]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
