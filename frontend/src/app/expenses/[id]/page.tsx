/**
 * Edit expense page
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { expensesApi } from '@/api/expenses';
import { Expense } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorAlert from '@/components/ErrorAlert';
import Link from 'next/link';

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams();
  const expenseId = parseInt(params.id as string);
  const { isAuthenticated } = useAuth();

  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    payment_method: 'Card',
    notes: '',
    expense_date: '',
  });

  const categories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Other'];
  const paymentMethods = ['Card', 'Cash', 'UPI', 'Bank Transfer', 'Wallet'];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchExpense = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await expensesApi.getExpense(expenseId);
        setExpense(data);
        setFormData({
          title: data.title,
          amount: data.amount.toString(),
          category: data.category,
          payment_method: data.payment_method,
          notes: data.notes || '',
          expense_date: new Date(data.expense_date).toISOString().split('T')[0],
        });
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load expense');
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();
  }, [mounted, isAuthenticated, router, expenseId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateAmount = (value: string) => {
    if (!/^[0-9]+(\.[0-9]{1,2})?$/.test(value)) {
      return 'Only positive numbers are accepted and the amount may have up to 2 decimal places.';
    }
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed <= 0) {
      return 'Only positive numbers are accepted.';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setSubmitting(true);
    setError(null);

    if (!formData.title || !formData.amount) {
      setLocalError('Title and amount are required');
      setSubmitting(false);
      return;
    }

    const amountError = validateAmount(formData.amount);
    if (amountError) {
      setLocalError(amountError);
      setSubmitting(false);
      return;
    }

    try {
      await expensesApi.updateExpense(expenseId, {
        title: formData.title,
        amount: parseFloat(formData.amount),
        category: formData.category,
        payment_method: formData.payment_method,
        notes: formData.notes,
        expense_date: new Date(formData.expense_date).toISOString(),
      });
      router.push('/expenses');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update expense');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return <div className="p-8 text-center">Please log in</div>;
  }

  if (!mounted || loading) {
    return (
      <div className="p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Edit Expense</h1>
        <Link href="/expenses" className="text-blue-600 hover:underline">
          ← Back to Expenses
        </Link>
      </div>

      {localError && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-lg mb-4">
          {localError}
        </div>
      )}

      {error && <ErrorAlert message={error} />}

      <div className="bg-white p-6 rounded-lg shadow">
        {expense ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Grocery shopping"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount (₹)</label>
                <input
                  type="number"
                  name="amount"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  name="expense_date"
                  value={formData.expense_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Add any notes about this expense..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Updating...' : 'Update Expense'}
              </button>
              <Link
                href="/expenses"
                className="flex-1 bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        ) : (
          <p className="text-center text-gray-500 py-8">Expense not found</p>
        )}
      </div>
    </div>
  );
}
