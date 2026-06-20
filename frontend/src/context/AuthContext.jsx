import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:8000/api';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [savedIds, setSavedIds]   = useState(new Set());

  const getAccessToken = () => localStorage.getItem('access');
  const getRefreshToken = () => localStorage.getItem('refresh');

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAccessToken()}`,
  });

  const fetchMe = async (token) => {
    try {
      const res = await fetch(`${API}/auth/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Invalid token');
      const data = await res.json();
      setUser(data);
      fetchSavedIds();
    } catch {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedIds = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      const res = await fetch(`${API}/auth/reading-list/ids/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const ids = await res.json();
      setSavedIds(new Set(ids));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (token) fetchMe(token);
    else setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await fetch(`${API}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Invalid username or password');
    }
    const data = await res.json();
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    await fetchMe(data.access);
    return data;
  };

  const register = async (username, email, password, password2) => {
    const res = await fetch(`${API}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, password2 }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(formatErrors(err));
    }
    const data = await res.json();
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    const refresh = getRefreshToken();
    try {
      await fetch(`${API}/auth/logout/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });
    } catch { /* ignore */ }
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
    setSavedIds(new Set());
  };

  const saveBook = async (bookId) => {
    const res = await fetch(`${API}/auth/save/${bookId}/`, {
      method: 'POST', headers: authHeaders(),
    });
    if (res.ok) setSavedIds(prev => new Set([...prev, bookId]));
    return res.ok;
  };

  const unsaveBook = async (bookId) => {
    const res = await fetch(`${API}/auth/unsave/${bookId}/`, {
      method: 'DELETE', headers: authHeaders(),
    });
    if (res.ok) setSavedIds(prev => { const s = new Set(prev); s.delete(bookId); return s; });
    return res.ok;
  };

  const toggleSave = async (bookId) => {
    if (!user) return false;
    if (savedIds.has(bookId)) return unsaveBook(bookId);
    return saveBook(bookId);
  };

  return (
    <AuthContext.Provider value={{
      user, loading, savedIds,
      login, register, logout,
      toggleSave, fetchSavedIds,
      getAccessToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

function formatErrors(errObj) {
  if (typeof errObj === 'string') return errObj;
  const parts = [];
  for (const [key, val] of Object.entries(errObj)) {
    const msg = Array.isArray(val) ? val.join(' ') : String(val);
    parts.push(`${key}: ${msg}`);
  }
  return parts.join(' | ') || 'Registration failed';
}

export const useAuth = () => useContext(AuthContext);