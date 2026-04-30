/**
 * Recurring expenses page
 */
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { recurringApi } from '@/api/recurring';
import { RecurringExpense } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorAlert from '@/components/ErrorAlert';
import Link from 'next/link';
import { format } from 'date-fns';

export default function RecurringPage() {
  const { isAuthenticated } = useAuth();
  const [expenses, setExpenses] = useState<RecurringExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecurring = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await recurringApi.getRecurringExpenses();
      setExpenses(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch recurring expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecurring();
    }
  }, [isAuthenticated]);

  const handleDelete = async (id: number) => {
    if (confirm('Delete this recurring expense?')) {
      try {
        await recurringApi.deleteRecurringExpense(id);
        setExpenses(expenses.filter((e) => e.id !== id));
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete expense');
      }
    }
  };

  if (!isAuthenticated) {
    return <div className="p-8 text-center">Please log in</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Recurring Expenses</h1>
        <Link
          href="/recurring/new"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Recurring
        </Link>
      </div>

      {error && <ErrorAlert message={error} />}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white p-6 rounded-lg shadow">
          {expenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2">Title</th>
                    <th className="border border-gray-300 px-4 py-2">Category</th>
                    <th className="border border-gray-300 px-4 py-2">Amount</th>
                    <th className="border border-gray-300 px-4 py-2">Frequency</th>
                    <th className="border border-gray-300 px-4 py-2">Next Due</th>
                    <th className="border border-gray-300 px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">{expense.title}</td>
                      <td className="border border-gray-300 px-4 py-2">{expense.category}</td>
                      <td className="border border-gray-300 px-4 py-2">₹{expense.amount.toFixed(2)}</td>
                      <td className="border border-gray-300 px-4 py-2 capitalize">{expense.frequency}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {format(new Date(expense.next_due_date), 'MMM dd, yyyy')}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No recurring expenses set</p>
          )}
        </div>
      )}
    </div>
  );
}
