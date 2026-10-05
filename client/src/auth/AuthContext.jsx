import React from 'react';
import { createContext, useContext, useState } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('hostelhub_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    async function login(email, password) {
        const response = await axiosClient.post('/auth/login', { email: email, password: password });
        localStorage.setItem('hostelhub_token', response.data.token);
        localStorage.setItem('hostelhub_user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        return response.data.user;
    }

    async function logout() {
        try { await axiosClient.post('/auth/logout'); } catch (error) { console.error(error); }
        localStorage.removeItem('hostelhub_token');
        localStorage.removeItem('hostelhub_user');
        setUser(null);
    }

    return <AuthContext.Provider value={{ user: user, login: login, logout: logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
