/**
 * Edit budget page
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { budgetsApi } from '@/api/budgets';
import { Budget } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorAlert from '@/components/ErrorAlert';
import Link from 'next/link';

export default function EditBudgetPage() {
  const router = useRouter();
  const params = useParams();
  const budgetId = params ? parseInt(params.id as string) : 0;
  const { isAuthenticated } = useAuth();

  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchBudget = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await budgetsApi.getBudget(budgetId);
        setBudget(data);
        setMonthlyLimit(data.monthly_limit.toString());
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load budget');
      } finally {
        setLoading(false);
      }
    };

    fetchBudget();
  }, [mounted, isAuthenticated, router, budgetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await budgetsApi.updateBudget(budgetId, {
        monthly_limit: parseFloat(monthlyLimit),
      });
      router.push('/budgets');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update budget');
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
        <h1 className="text-4xl font-bold mb-2">Edit Budget</h1>
        <Link href="/budgets" className="text-blue-600 hover:underline">
          ← Back to Budgets
        </Link>
      </div>

      {error && <ErrorAlert message={error} />}

      <div className="bg-white p-6 rounded-lg shadow">
        {budget ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <input
                type="text"
                value={budget.category}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">Category cannot be changed</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Month</label>
                <input
                  type="text"
                  value={budget.month}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Year</label>
                <input
                  type="text"
                  value={budget.year}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Monthly Limit (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                placeholder="Enter new budget limit"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 Tip: Change this limit to track spending in this category
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting || !monthlyLimit}
                className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Updating...' : 'Update Budget'}
              </button>
              <Link
                href="/budgets"
                className="flex-1 bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        ) : (
          <p className="text-center text-gray-500 py-8">Budget not found</p>
        )}
      </div>
    </div>
  );
}
