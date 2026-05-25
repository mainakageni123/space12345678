import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config/api';

const AdminAuthContext = createContext(null);

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Proactively clear any lingering localStorage tokens to enforce per-session auth
        try { localStorage.removeItem('adminToken'); } catch (e) { }
        try { localStorage.removeItem('admin_token'); } catch (e) { }
        verifyToken();
    }, []);

    const verifyToken = useCallback(async () => {
        // Enforce session-only auth: read token strictly from sessionStorage
        const token = sessionStorage.getItem('admin_token');
        if (!token) {
            setAdmin(null);
            setLoading(false);
            return;
        }

        try {
            console.log('Verifying token...');
            const response = await fetch(`${API_BASE_URL}/admin/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAdmin(data);
            } else {
                console.log('Token verification failed');
                try { sessionStorage.removeItem('admin_token'); } catch (e) { }
                setAdmin(null);
            }
        } catch (error) {
            console.error('Token verification error:', error);
            try { sessionStorage.removeItem('admin_token'); } catch (e) { }
            setAdmin(null);
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const loginUrl = `${API_BASE_URL}/admin/auth/login`;
            console.log('Attempting login at:', loginUrl);
            const response = await fetch(loginUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            let data;
            let parseError = null;
            try {
                data = await response.json();
            } catch (jsonErr) {
                parseError = jsonErr;
            }
            console.log('Login response:', data);

            if (!response.ok || !data?.success) {
                // If JSON parse failed, use status text
                if (parseError) {
                    throw new Error(`Login failed: ${response.status} ${response.statusText}`);
                } else {
                    throw new Error(data?.message || 'Login failed');
                }
            }

            // Persist token only in sessionStorage to require re-login on new visits
            try {
                sessionStorage.setItem('admin_token', data.token);
                sessionStorage.setItem('admin_username', data.admin.username);
            } catch (e) { /* ignore */ }
            setAdmin(data.admin);
            return true;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = () => {
        // Clear all known token keys
        try { sessionStorage.removeItem('admin_token'); } catch (e) { }
        try { sessionStorage.removeItem('admin_username'); } catch (e) { }
        try { sessionStorage.removeItem('admin_info'); } catch (e) { }
        try { localStorage.removeItem('adminToken'); } catch (e) { }
        try { localStorage.removeItem('admin_token'); } catch (e) { }
        try { localStorage.removeItem('admin_info'); } catch (e) { }
        setAdmin(null);
    };

    return (
        <AdminAuthContext.Provider value={{ admin, loading, login, logout, verifyToken }}>
            {children}
        </AdminAuthContext.Provider>
    );
};
