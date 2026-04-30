/**
 * Custom hook for authentication
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/api/auth';
import { User } from '@/types';

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Check auth state on mount (client-only)
  useEffect(() => {
    setIsAuth(authApi.isAuthenticated());
    setMounted(true);
  }, []);

  const signup = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authApi.signup(email, password);
      setUser(result.user);
      setIsAuth(true);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authApi.login(email, password);
      setUser(result.user);
      setIsAuth(true);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setIsAuth(false);
    router.push('/login');
  };

  return {
    user: user || (mounted ? authApi.getCurrentUser() : null),
    isAuthenticated: mounted ? isAuth : false,
    loading,
    error,
    signup,
    login,
    logout,
  };
};
