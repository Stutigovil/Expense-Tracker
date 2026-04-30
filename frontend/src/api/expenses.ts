/**
 * API endpoints for expenses
 */
import { api } from '@/lib/apiClient';
import { Expense, ExpenseListResponse, ExpenseFilters } from '@/types';

export const expensesApi = {
  async createExpense(data: {
    title: string;
    amount: number;
    category: string;
    payment_method: string;
    notes?: string;
    expense_date: string;
  }): Promise<Expense> {
    const response = await api.post('/expenses', data);
    return response.data;
  },

  async getExpenses(filters?: ExpenseFilters): Promise<ExpenseListResponse> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.sort_by) params.append('sort_by', filters.sort_by);
    if (filters?.from_date) params.append('from_date', filters.from_date);
    if (filters?.to_date) params.append('to_date', filters.to_date);
    if (filters?.min_amount !== undefined) params.append('min_amount', filters.min_amount.toString());
    if (filters?.max_amount !== undefined) params.append('max_amount', filters.max_amount.toString());
    if (filters?.search) params.append('search', filters.search);
    params.append('skip', (filters?.skip || 0).toString());
    params.append('limit', (filters?.limit || 20).toString());

    const response = await api.get(`/expenses?${params.toString()}`);
    return response.data;
  },

  async getExpense(id: number): Promise<Expense> {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  async updateExpense(
    id: number,
    data: Partial<{
      title: string;
      amount: number;
      category: string;
      payment_method: string;
      notes: string;
      expense_date: string;
    }>
  ): Promise<Expense> {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  },

  async deleteExpense(id: number): Promise<void> {
    await api.delete(`/expenses/${id}`);
  },
};
