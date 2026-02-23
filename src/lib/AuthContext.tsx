'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, getAuthToken, removeAuthToken } from './api';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'USER' | 'ADMIN';
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        const token = getAuthToken();
        if (token) {
            // In a real app, you'd verify the token with the backend
            // For now, we'll assume it's valid and decode user info
            try {
                // This is a simplified approach - in production, verify with backend
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({
                    id: payload.userId || payload.id,
                    name: payload.name || 'User',
                    email: payload.email || '',
                    role: payload.role || 'USER'
                });
            } catch (error) {
                console.error('Invalid token:', error);
                removeAuthToken();
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await authAPI.login({ email, password });

            if (response.success && response.data) {
                const { user: userData, token } = response.data;

                // Decode token to get complete user info
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const userInfo: User = {
                        id: payload.userId || payload.id || userData.id,
                        name: userData.name || payload.name || 'User',
                        email: userData.email || payload.email || email,
                        role: (userData.role || payload.role || 'USER') as 'USER' | 'ADMIN'
                    };
                    setUser(userInfo);
                    console.log('✅ Login berhasil! User:', userInfo);
                } catch (decodeError) {
                    console.error('Error decoding token:', decodeError);
                    // Fallback to userData if token decode fails
                    setUser(userData as User);
                }

                return { success: true };
            } else {
                return {
                    success: false,
                    message: response.error || 'Login failed'
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: 'Network error. Please try again.'
            };
        }
    };

    const register = async (name: string, email: string, password: string) => {
        try {
            const response = await authAPI.register({ name, email, password });

            if (response.success && response.data) {
                const { user: userData, token } = response.data;

                // Decode token to get complete user info
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const userInfo: User = {
                        id: payload.userId || payload.id || userData.id,
                        name: userData.name || payload.name || name,
                        email: userData.email || payload.email || email,
                        role: (userData.role || payload.role || 'USER') as 'USER' | 'ADMIN'
                    };
                    setUser(userInfo);
                    console.log('✅ Register berhasil! User:', userInfo);
                } catch (decodeError) {
                    console.error('Error decoding token:', decodeError);
                    setUser(userData as User);
                }

                return { success: true };
            } else {
                return {
                    success: false,
                    message: response.error || 'Registration failed'
                };
            }
        } catch (error) {
            console.error('Register error:', error);
            return {
                success: false,
                message: 'Network error. Please try again.'
            };
        }
    };

    const logout = () => {
        authAPI.logout();
        setUser(null);
    };

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};