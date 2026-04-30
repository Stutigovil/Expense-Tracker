/**
 * Budgets page
 */
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { budgetsApi } from '@/api/budgets';
import { Budget } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorAlert from '@/components/ErrorAlert';
import Link from 'next/link';

export default function BudgetsPage() {
  const { isAuthenticated } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const categories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Other'];

  const fetchBudgets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await budgetsApi.getBudgets(selectedYear, selectedMonth);
      setBudgets(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBudgets();
    }
  }, [selectedMonth, selectedYear, isAuthenticated]);

  const handleDelete = async (id: number) => {
    if (confirm('Delete this budget?')) {
      try {
        await budgetsApi.deleteBudget(id);
        setBudgets(budgets.filter((b) => b.id !== id));
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete budget');
      }
    }
  };

  if (!isAuthenticated) {
    return <div className="p-8 text-center">Please log in</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Budgets</h1>
        <Link
          href="/budgets/new"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Budget
        </Link>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* Month/Year selector */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex gap-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2024, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - 2 + i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white p-6 rounded-lg shadow">
          {budgets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2">Category</th>
                    <th className="border border-gray-300 px-4 py-2">Monthly Limit</th>
                    <th className="border border-gray-300 px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {budgets.map((budget) => (
                    <tr key={budget.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">{budget.category}</td>
                      <td className="border border-gray-300 px-4 py-2">₹{budget.monthly_limit.toFixed(2)}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex gap-2">
                          <Link
                            href={`/budgets/${budget.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(budget.id)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No budgets set for this month</p>
          )}
        </div>
      )}
    </div>
  );
}
