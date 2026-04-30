/**
 * Add new recurring expense page
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { recurringApi } from '@/api/recurring';
import { useAuth } from '@/hooks/useAuth';
import ErrorAlert from '@/components/ErrorAlert';
import Link from 'next/link';

export default function NewRecurringPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    frequency: 'monthly',
    next_due_date: new Date().toISOString().split('T')[0],
  });

  const categories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Other'];
  const frequencies = ['weekly', 'monthly', 'yearly'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title || !formData.amount) {
      setError('Title and amount are required');
      return;
    }

    setLoading(true);
    try {
      const dueDatetime = new Date(formData.next_due_date).toISOString();

      await recurringApi.createRecurringExpense({
        ...formData,
        amount: parseFloat(formData.amount),
        next_due_date: dueDatetime,
      });
      router.push('/recurring');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create recurring expense');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <div className="p-8 text-center">Please log in</div>;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Add Recurring Expense</h1>

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
            placeholder="e.g., Netflix Subscription"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
            <label className="block text-sm font-medium mb-2">Frequency *</label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              disabled={loading}
            >
              {frequencies.map((freq) => (
                <option key={freq} value={freq}>
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Next Due Date *</label>
          <input
            type="date"
            name="next_due_date"
            value={formData.next_due_date}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
          >
            {loading ? 'Adding...' : 'Add Recurring Expense'}
          </button>
          <Link
            href="/recurring"
            className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 text-center font-semibold"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
