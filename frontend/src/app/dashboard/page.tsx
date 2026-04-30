/**
 * Dashboard page
 */
'use client';

import { useEffect, useState } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorAlert from '@/components/ErrorAlert';
import StatCard from '@/components/StatCard';
import BudgetCard from '@/components/BudgetCard';
import CategoryChart from '@/components/CategoryChart';
import ExpensesTable from '@/components/ExpensesTable';

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const { dashboard, loading, error, fetchDashboard } = useDashboard();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboard(selectedYear, selectedMonth);
    }
  }, [selectedMonth, selectedYear, isAuthenticated]);

  if (!isAuthenticated) {
    return <div className="p-8 text-center">Please log in to view dashboard</div>;
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Dashboard</h1>

        {/* Month/Year selector */}
        <div className="flex gap-4 mb-6">
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

      {error && <ErrorAlert message={error} />}

      {dashboard && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatCard
              title="This Month"
              value={`₹${dashboard.summary.total_expenses_month.toFixed(2)}`}
              icon="💸"
              color="blue"
            />
            <StatCard
              title="This Year"
              value={`₹${dashboard.summary.total_expenses_year.toFixed(2)}`}
              icon="📊"
              color="green"
            />
            <StatCard
              title="Avg Daily"
              value={`₹${dashboard.summary.average_daily_spend.toFixed(2)}`}
              icon="📈"
              color="yellow"
            />
            <StatCard
              title="Transactions (Month)"
              value={dashboard.summary.transaction_count_month}
              icon="📝"
              color="blue"
            />
            <StatCard
              title="Transactions (Year)"
              value={dashboard.summary.transaction_count_year}
              icon="📋"
              color="green"
            />
          </div>

          {/* Category Chart and Budget Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {dashboard.categories.items.length > 0 && (
              <CategoryChart data={dashboard.categories.items} />
            )}

            {/* Budget Alerts */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Budget Alerts</h3>
              {dashboard.budget_alerts.length > 0 ? (
                <div className="space-y-3">
                  {dashboard.budget_alerts.map((alert) => (
                    <BudgetCard
                      key={alert.category}
                      category={alert.category}
                      spent={alert.spent}
                      limit={alert.monthly_limit}
                      percentage={alert.percentage}
                      isExceeded={alert.is_exceeded}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No budgets set for this month</p>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
            {dashboard.recent_transactions.length > 0 ? (
              <ExpensesTable
                expenses={dashboard.recent_transactions}
                onDelete={() => {}}
              />
            ) : (
              <p className="text-gray-500">No transactions yet</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
