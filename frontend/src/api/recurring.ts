/**
 * API endpoints for recurring expenses
 */
import { api } from '@/lib/apiClient';
import { RecurringExpense } from '@/types';

export const recurringApi = {
  async createRecurringExpense(data: {
    title: string;
    amount: number;
    category: string;
    frequency: 'weekly' | 'monthly' | 'yearly';
    next_due_date: string;
  }): Promise<RecurringExpense> {
    const response = await api.post('/recurring-expenses', data);
    return response.data;
  },

  async getRecurringExpenses(): Promise<RecurringExpense[]> {
    const response = await api.get('/recurring-expenses');
    return response.data;
  },

  async updateRecurringExpense(
    id: number,
    data: Partial<{
      title: string;
      amount: number;
      category: string;
      frequency: 'weekly' | 'monthly' | 'yearly';
      next_due_date: string;
    }>
  ): Promise<RecurringExpense> {
    const response = await api.put(`/recurring-expenses/${id}`, data);
    return response.data;
  },

  async deleteRecurringExpense(id: number): Promise<void> {
    await api.delete(`/recurring-expenses/${id}`);
  },
};
