/**
 * API endpoints for dashboard
 */
import { api } from '@/lib/apiClient';
import {
  DashboardResponse,
  DashboardSummary,
  DashboardCategoryBreakdown,
  BudgetAlert,
  Expense,
} from '@/types';

export const dashboardApi = {
  async getDashboard(year?: number, month?: number): Promise<DashboardResponse> {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());

    const response = await api.get(`/dashboard?${params.toString()}`);
    return response.data;
  },

  async getSummary(year?: number, month?: number): Promise<DashboardSummary> {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());

    const response = await api.get(`/dashboard/summary?${params.toString()}`);
    return response.data;
  },

  async getCategoryBreakdown(year?: number, month?: number): Promise<DashboardCategoryBreakdown> {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());

    const response = await api.get(`/dashboard/category-breakdown?${params.toString()}`);
    return response.data;
  },

  async getBudgetAlerts(year?: number, month?: number): Promise<BudgetAlert[]> {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());

    const response = await api.get(`/dashboard/budget-alerts?${params.toString()}`);
    return response.data;
  },

  async getRecentTransactions(limit?: number): Promise<Expense[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());

    const response = await api.get(`/dashboard/recent-transactions?${params.toString()}`);
    return response.data;
  },
};
