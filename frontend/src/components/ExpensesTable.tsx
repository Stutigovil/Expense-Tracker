/**
 * Expenses table component
 */
'use client';

import { Expense } from '@/types';
import { format } from 'date-fns';
import Link from 'next/link';

interface ExpensesTableProps {
  expenses: Expense[];
  onDelete: (id: number) => void;
  loading?: boolean;
}

export default function ExpensesTable({ expenses, onDelete, loading }: ExpensesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-4 py-2">Date</th>
            <th className="border border-gray-300 px-4 py-2">Title</th>
            <th className="border border-gray-300 px-4 py-2">Category</th>
            <th className="border border-gray-300 px-4 py-2">Amount</th>
            <th className="border border-gray-300 px-4 py-2">Method</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">
                {format(new Date(expense.expense_date), 'MMM dd, yyyy')}
              </td>
              <td className="border border-gray-300 px-4 py-2">{expense.title}</td>
              <td className="border border-gray-300 px-4 py-2">{expense.category}</td>
              <td className="border border-gray-300 px-4 py-2 font-semibold">
                ₹{expense.amount.toFixed(2)}
              </td>
              <td className="border border-gray-300 px-4 py-2">{expense.payment_method}</td>
              <td className="border border-gray-300 px-4 py-2">
                <Link href={`/expenses/${expense.id}`} className="text-blue-600 hover:underline">
                  Edit
                </Link>
                <button
                  onClick={() => onDelete(expense.id)}
                  className="ml-2 text-red-600 hover:underline"
                  disabled={loading}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
