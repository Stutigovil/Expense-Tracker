/**
 * API endpoints for budgets
 */
import { api } from '@/lib/apiClient';
import { Budget } from '@/types';

export const budgetsApi = {
  async createBudget(data: {
    category: string;
    monthly_limit: number;
    month: number;
    year: number;
  }): Promise<Budget> {
    const response = await api.post('/budgets', data);
    return response.data;
  },

  async getBudgets(year: number, month: number): Promise<Budget[]> {
    const response = await api.get(`/budgets?year=${year}&month=${month}`);
    return response.data;
  },

  async getBudget(id: number): Promise<Budget> {
    const response = await api.get(`/budgets/${id}`);
    return response.data;
  },

  async updateBudget(id: number, data: { monthly_limit: number }): Promise<Budget> {
    const response = await api.put(`/budgets/${id}`, data);
    return response.data;
  },

  async deleteBudget(id: number): Promise<void> {
    await api.delete(`/budgets/${id}`);
  },
};
