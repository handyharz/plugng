'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (credentials: any) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    verifyOTP: (otp: string) => Promise<void>;
    setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const checkAuth = async () => {
        try {
            const userData = await authApi.getMe();
            setUser(userData);
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (credentials: any) => {
        console.time('⏱️ Login Process');
        try {
            const { data } = await authApi.login(credentials);
            console.timeLog('⏱️ Login Process', 'API call success');
            setUser(data.user);
            console.timeLog('⏱️ Login Process', 'User state set');
            // Redirect will be handled by useEffect to ensure state is committed
        } catch (error) {
            console.timeEnd('⏱️ Login Process');
            throw error;
        }
    };

    const register = async (userData: any) => {
        console.time('⏱️ Register Process');
        try {
            const { data } = await authApi.register(userData);
            console.timeLog('⏱️ Register Process', 'API call success');
            setUser(data.user);
            console.timeLog('⏱️ Register Process', 'User state set');
            router.push('/verify-otp');
        } catch (error) {
            console.timeEnd('⏱️ Register Process');
            throw error;
        }
    };

    // Separate effect for redirect after login success
    useEffect(() => {
        if (user && !isLoading) {
            const currentPath = window.location.pathname;
            if (currentPath === '/login') {
                console.timeLog('⏱️ Login Process', 'Triggering redirect to /');
                router.push('/');
                console.timeEnd('⏱️ Login Process');
            }
        }
    }, [user, isLoading, router]);

    const logout = async () => {
        await authApi.logout();
        setUser(null);
        router.push('/login');
    };

    const verifyOTP = async (otp: string) => {
        await authApi.verifyOTP({ otp });
        if (user) {
            setUser({ ...user, phoneVerified: true });
        }
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            login,
            register,
            logout,
            checkAuth,
            verifyOTP,
            setUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
