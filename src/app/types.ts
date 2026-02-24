export interface User {
  id: string;
  email: string;
  name: string;
  currency: string;
  monthlyIncome: number;
  salaryDay: number;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  tags: string[];
  isRecurring: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  receiptUrl?: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  month: string; // YYYY-MM format
  spent: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  createdAt: string;
}

export interface FinancialHealthScore {
  score: number;
  savingsRatio: number;
  budgetAdherence: number;
  expenseVolatility: number;
  goalConsistency: number;
}

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Bills & Utilities',
  'Entertainment',
  'Healthcare',
  'Education',
  'Travel',
  'Groceries',
  'Personal Care',
  'Other',
];

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment',
  'Business',
  'Gift',
  'Other',
];
