import { createContext, useContext, useState, useEffect } from 'react';

import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('codenest_session');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('codenest_session');
      }
    }
    setLoading(false);
  }, []);

  const signup = async (data) => {
    try {
      const result = await api.auth.signup(data);
      if (!result.success) return { success: false, error: result.error };

      setUser(result.user);
      localStorage.setItem('codenest_session', JSON.stringify(result.user));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Registration failed' };
    }
  };

  const login = async (email, password) => {
    try {
      const result = await api.auth.login(email, password);
      if (!result.success) return { success: false, error: result.error };

      setUser(result.user);
      localStorage.setItem('codenest_session', JSON.stringify(result.user));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('codenest_session');
  };

  const updateProfile = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('codenest_session', JSON.stringify(updated));
    // We would ideally call api.auth.updateProfile(updates) here
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
