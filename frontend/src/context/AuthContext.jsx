import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('oep_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('oep_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validate session on mount
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem('oep_user', JSON.stringify(res.data.user));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: jwtToken, user: userData } = res.data;
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('oep_token', jwtToken);
    localStorage.setItem('oep_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (name, email, password, role = 'Student') => {
    const res = await api.post('/auth/register', { name, email, password, role });
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('oep_token');
    localStorage.removeItem('oep_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, role: user?.role, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
