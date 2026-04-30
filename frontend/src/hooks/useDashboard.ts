/**
 * Custom hook for dashboard
 */
'use client';

import { useState } from 'react';
import { dashboardApi } from '@/api/dashboard';
import {
  DashboardResponse,
  DashboardSummary,
  DashboardCategoryBreakdown,
  BudgetAlert,
  Expense,
} from '@/types';

export const useDashboard = () => {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async (year?: number, month?: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.getDashboard(year, month);
      setDashboard(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch dashboard');
    } finally {
      setLoading(false);
    }
  };

  return {
    dashboard,
    loading,
    error,
    fetchDashboard,
  };
};
