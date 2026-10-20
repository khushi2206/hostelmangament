import React, { createContext, useState } from 'react';
import axiosClient from '../api/axiosClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hostelhub_user') || 'null'); }
    catch { return null; }
  });
  const [loading] = useState(false);

  const login = async (email, password) => {
    const response = await axiosClient.post('/auth/login', { email, password });
    localStorage.setItem('hostelhub_token', response.data.token);
    localStorage.setItem('hostelhub_user', JSON.stringify(response.data.user));
    setUser(response.data.user);
    return response.data.user;
  };

  const logout = async () => {
    try { await axiosClient.post('/auth/logout'); } catch (error) { console.error(error); }
    localStorage.removeItem('hostelhub_token');
    localStorage.removeItem('hostelhub_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
