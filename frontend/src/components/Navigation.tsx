/**
 * Navigation component
 */
'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

export default function Navigation() {
  const { isAuthenticated, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch - don't render auth-dependent content until mounted
  if (!mounted) {
    return (
      <nav className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            💰 Expense Tracker
          </Link>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-blue-200">
              Login
            </Link>
            <Link href="/signup" className="hover:text-blue-200">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          💰 Expense Tracker
        </Link>

        {isAuthenticated ? (
          <div className="flex gap-6">
            <Link href="/dashboard" className="hover:text-blue-200">
              Dashboard
            </Link>
            <Link href="/expenses" className="hover:text-blue-200">
              Expenses
            </Link>
            <Link href="/budgets" className="hover:text-blue-200">
              Budgets
            </Link>
            <Link href="/recurring" className="hover:text-blue-200">
              Recurring
            </Link>
            <button onClick={logout} className="hover:text-blue-200">
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-blue-200">
              Login
            </Link>
            <Link href="/signup" className="hover:text-blue-200">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
