'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authApi } from '@/lib/api';

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'customer' | 'admin' | 'super_admin' | 'manager' | 'support' | 'editor';
}

interface AdminAuthContextType {
    admin: User | null;
    isLoading: boolean;
    login: (credentials: any) => Promise<void>;
    logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
    const [admin, setAdmin] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const checkAuth = async () => {
        try {
            const userData = await authApi.getMe();
            console.log('AdminAuth - checkAuth user data:', userData);
            if (userData.role && userData.role !== 'customer') {
                console.log('AdminAuth - checkAuth: Access granted for role:', userData.role);
                setAdmin(userData);
            } else {
                console.warn('AdminAuth - checkAuth: Access denied for role:', userData.role);
                setAdmin(null);
            }
        } catch (error) {
            setAdmin(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (credentials: any) => {
        try {
            const { data } = await authApi.login(credentials);
            console.log('AdminAuth - login response data:', data);
            if (!data.user.role || data.user.role === 'customer') {
                console.warn('AdminAuth - login: Unauthorized role:', data.user.role);
                throw new Error('Unauthorized access');
            }
            setAdmin(data.user);
            router.push('/dashboard');
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authApi.logout();
            setAdmin(null);
            router.push('/admin/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // Protect admin routes
    useEffect(() => {
        if (!isLoading) {
            const isLoginPage = pathname === '/admin/login';

            if (!admin && !isLoginPage) {
                router.push('/admin/login');
            } else if (admin && isLoginPage) {
                router.push('/dashboard');
            }
        }
    }, [admin, isLoading, pathname, router]);

    return (
        <AdminAuthContext.Provider value={{
            admin,
            isLoading,
            login,
            logout
        }}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
}
