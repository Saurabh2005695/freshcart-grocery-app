import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Customer State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('freshcart_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('freshcart_token') || null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' or 'signup'
  const [authRedirectAction, setAuthRedirectAction] = useState(null);

  // Admin State (Completely Isolated)
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('freshcart_admin');
    return saved ? JSON.parse(saved) : null;
  });
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('freshcart_admin_token') || null);

  // Sync Customer State
  useEffect(() => {
    if (user && token) {
      localStorage.setItem('freshcart_user', JSON.stringify(user));
      localStorage.setItem('freshcart_token', token);
    } else {
      localStorage.removeItem('freshcart_user');
      localStorage.removeItem('freshcart_token');
    }
  }, [user, token]);

  // Sync Admin State
  useEffect(() => {
    if (admin && adminToken) {
      localStorage.setItem('freshcart_admin', JSON.stringify(admin));
      localStorage.setItem('freshcart_admin_token', adminToken);
    } else {
      localStorage.removeItem('freshcart_admin');
      localStorage.removeItem('freshcart_admin_token');
    }
  }, [admin, adminToken]);

  // Customer Auth Functions
  const loginCustomer = async (email, password) => {
    const res = await api.login({ email, password });
    setUser(res.user);
    setToken(res.token);
    setIsAuthModalOpen(false);
    if (authRedirectAction) {
      authRedirectAction();
      setAuthRedirectAction(null);
    }
    return res;
  };

  const registerCustomer = async (data) => {
    const res = await api.register(data);
    setUser(res.user);
    setToken(res.token);
    setIsAuthModalOpen(false);
    if (authRedirectAction) {
      authRedirectAction();
      setAuthRedirectAction(null);
    }
    return res;
  };

  const logoutCustomer = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('freshcart_user');
    localStorage.removeItem('freshcart_token');
  };

  const openAuthModal = (mode = 'login', callbackAfterAuth = null) => {
    setAuthModalMode(mode);
    setAuthRedirectAction(() => callbackAfterAuth);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthRedirectAction(null);
  };

  // Admin Auth Functions
  const loginAdmin = async (email, password) => {
    const res = await api.adminLogin({ email, password });
    setAdmin(res.admin);
    setAdminToken(res.token);
    return res;
  };

  const logoutAdmin = () => {
    setAdmin(null);
    setAdminToken(null);
    localStorage.removeItem('freshcart_admin');
    localStorage.removeItem('freshcart_admin_token');
  };

  return (
    <AuthContext.Provider
      value={{
        // Customer
        user,
        setUser,
        token,
        isAuthenticated: !!user && !!token,
        loginCustomer,
        registerCustomer,
        logoutCustomer,
        isAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        closeAuthModal,

        // Admin
        admin,
        adminToken,
        isAdminAuthenticated: !!admin && !!adminToken,
        loginAdmin,
        logoutAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
