import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const checkLoggedIn = async () => {
        try {
            const res = await api.get('/auth/me');
            if (res.data && res.data.success) {
                setUser(res.data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        checkLoggedIn();
    }, []);
    const login = async (username, password) => {
        const res = await api.post('/auth/login', { username, password });
        if (res.data && res.data.success) {
            setUser(res.data.user);
            return res.data.user;
        }
        throw new Error(res.data.message || 'Đăng nhập thất bại');
    };
    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            window.location.href = '/login';
        }
    };
    return (
        <AuthContext.Provider value={{ user, loading, login, logout, setUser, checkLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};