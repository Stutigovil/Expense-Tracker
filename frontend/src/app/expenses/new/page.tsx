/**
 * Add new expense page
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useExpenses } from '@/hooks/useExpenses';
import { useAuth } from '@/hooks/useAuth';
import ErrorAlert from '@/components/ErrorAlert';
import Link from 'next/link';

export default function NewExpensePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { createExpense, error } = useExpenses();
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    payment_method: 'Cash',
    notes: '',
    expense_date: new Date().toISOString().split('T')[0],
  });

  const categories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Other'];
  const paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Wallet'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    if (!formData.title || !formData.amount) {
      setLocalError('Title and amount are required');
      return;
    }

    const amountError = validateAmount(formData.amount);
    if (amountError) {
      setLocalError(amountError);
      return;
    }

    setLoading(true);
    try {
      // Convert date to ISO datetime
      const expenseDatetime = new Date(formData.expense_date).toISOString();

      await createExpense({
        ...formData,
        amount: parseFloat(formData.amount),
        expense_date: expenseDatetime,
      });
      router.push('/expenses');
    } catch (err) {
      // Error is handled
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <div className="p-8 text-center">Please log in</div>;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Add New Expense</h1>

      {localError && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-lg mb-4">
          {localError}
        </div>
      )}

      {error && <ErrorAlert message={error} />}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Grocery shopping"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Amount (₹) *</label>
          <input
            type="number"
            name="amount"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Payment Method *</label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
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
          <label className="block text-sm font-medium mb-2">Date *</label>
          <input
            type="date"
            name="expense_date"
            value={formData.expense_date}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional notes..."
            rows={4}
            disabled={loading}
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
          >
            {loading ? 'Adding...' : 'Add Expense'}
          </button>
          <Link
            href="/expenses"
            className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 text-center font-semibold"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
