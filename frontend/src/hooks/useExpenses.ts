/**
 * Custom hook for expenses
 */
'use client';

import { useState } from 'react';
import { expensesApi } from '@/api/expenses';
import { Expense, ExpenseListResponse, ExpenseFilters } from '@/types';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const formatErrorMessage = (err: any, fallback: string) => {
    const detail = err?.response?.data?.detail;
    if (Array.isArray(detail)) {
      return detail
        .map((item: any) => item?.msg || item?.message || JSON.stringify(item))
        .join('; ');
    }
    if (typeof detail === 'string') {
      return detail;
    }
    if (detail && typeof detail === 'object') {
      return detail.message || JSON.stringify(detail);
    }
    return err?.message || fallback;
  };

  const fetchExpenses = async (filters?: ExpenseFilters) => {
    setLoading(true);
    setError(null);
    try {
      const result = await expensesApi.getExpenses(filters);
      setExpenses(result.items);
      setTotal(result.total);
      setTotalPages(result.total_pages);
    } catch (err: any) {
      setError(formatErrorMessage(err, 'Failed to fetch expenses'));
    } finally {
      setLoading(false);
    }
  };

  const createExpense = async (data: any) => {
    try {
      const expense = await expensesApi.createExpense(data);
      setExpenses([expense, ...expenses]);
      return expense;
    } catch (err: any) {
      setError(formatErrorMessage(err, 'Failed to create expense'));
      throw err;
    }
  };

  const updateExpense = async (id: number, data: any) => {
    try {
      const expense = await expensesApi.updateExpense(id, data);
      setExpenses(expenses.map((e) => (e.id === id ? expense : e)));
      return expense;
    } catch (err: any) {
      setError(formatErrorMessage(err, 'Failed to update expense'));
      throw err;
    }
  };

  const deleteExpense = async (id: number) => {
    try {
      await expensesApi.deleteExpense(id);
      setExpenses(expenses.filter((e) => e.id !== id));
    } catch (err: any) {
      setError(formatErrorMessage(err, 'Failed to delete expense'));
      throw err;
    }
  };

  return {
    expenses,
    loading,
    error,
    total,
    totalPages,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
  };
};
