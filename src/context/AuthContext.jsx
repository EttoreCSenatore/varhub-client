/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { TOKEN_KEY, errorMessage } from '../utils/api';

const AuthContext = createContext(null);

const readToken = () => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};
const writeToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch { /* storage unavailable */ }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(readToken()));

  // Restore the session by asking the server who the token belongs to.
  useEffect(() => {
    if (!readToken()) return undefined;
    let cancelled = false;
    api.get('/api/auth/me')
      .then(({ data }) => { if (!cancelled) setUser(data.user); })
      .catch((error) => {
        // Only drop the token when the server rejected it; keep it if we are merely offline.
        if (error?.response?.status === 401) writeToken(null);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const authenticate = useCallback(async (path, payload) => {
    try {
      const { data } = await api.post(path, payload);
      writeToken(data.token);
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, message: errorMessage(error, 'Could not sign you in.') };
    }
  }, []);

  const login = useCallback((email, password) => authenticate('/api/auth/login', { email, password }), [authenticate]);
  const register = useCallback((name, email, password) => authenticate('/api/auth/register', { name, email, password }), [authenticate]);
  const logout = useCallback(() => { writeToken(null); setUser(null); }, []);

  const value = useMemo(
    () => ({ user, loading, isAdmin: user?.role === 'admin', login, register, logout }),
    [user, loading, login, register, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
