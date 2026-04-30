/**
 * Type definitions for the API
 */

export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface Expense {
  id: number;
  user_id: number;
  title: string;
  amount: number;
  category: string;
  payment_method: string;
  notes?: string;
  expense_date: string;
  created_at: string;
}

export interface ExpenseFilters {
  category?: string;
  sort_by?: 'newest' | 'oldest' | 'highest' | 'lowest';
  from_date?: string;
  to_date?: string;
  min_amount?: number;
  max_amount?: number;
  search?: string;
  skip?: number;
  limit?: number;
}

export interface ExpenseListResponse {
  items: Expense[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface Budget {
  id: number;
  user_id: number;
  category: string;
  monthly_limit: number;
  month: number;
  year: number;
}

export interface BudgetAlert {
  category: string;
  monthly_limit: number;
  spent: number;
  percentage: number;
  is_exceeded: boolean;
}

export interface RecurringExpense {
  id: number;
  user_id: number;
  title: string;
  amount: number;
  category: string;
  frequency: 'weekly' | 'monthly' | 'yearly';
  next_due_date: string;
  is_active: number;
  created_at: string;
}

export interface DashboardSummary {
  total_expenses_month: number;
  total_expenses_year: number;
  average_daily_spend: number;
  transaction_count_month: number;
  transaction_count_year: number;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export interface DashboardCategoryBreakdown {
  items: CategoryBreakdown[];
  total_spent: number;
}

export interface DashboardResponse {
  summary: DashboardSummary;
  categories: DashboardCategoryBreakdown;
  budget_alerts: BudgetAlert[];
  recent_transactions: Expense[];
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: User;
}
