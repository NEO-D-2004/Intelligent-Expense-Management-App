import { Transaction, Budget, SavingsGoal, FinancialHealthScore } from '../types';
import { getTransactions, getBudgets, getGoals } from './storage';

export const getDateRange = (range: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
  const now = new Date();
  const start = new Date();

  switch (range) {
    case 'daily':
      start.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      start.setDate(now.getDate() - 7);
      break;
    case 'monthly':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'yearly':
      start.setFullYear(now.getFullYear() - 1);
      break;
  }

  return { start, end: now };
};

export const filterTransactionsByDateRange = (
  transactions: Transaction[],
  start: Date,
  end: Date
): Transaction[] => {
  return transactions.filter(t => {
    const date = new Date(t.date);
    return date >= start && date <= end;
  });
};

export const getTotalIncome = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
};

export const getTotalExpenses = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
};

export const getExpensesByCategory = (transactions: Transaction[]): Record<string, number> => {
  const expenses = transactions.filter(t => t.type === 'expense');
  const byCategory: Record<string, number> = {};

  expenses.forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
  });

  return byCategory;
};

export const getMonthlyTrend = (transactions: Transaction[], months: number = 6) => {
  const trend: Array<{ month: string; income: number; expenses: number }> = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = date.toISOString().slice(0, 7);
    
    const monthTransactions = transactions.filter(t => t.date.startsWith(monthStr));
    
    trend.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      income: getTotalIncome(monthTransactions),
      expenses: getTotalExpenses(monthTransactions),
    });
  }

  return trend;
};

export const detectSpendingSpikes = (transactions: Transaction[]): string[] => {
  const alerts: string[] = [];
  const currentMonth = new Date().toISOString().slice(0, 7);
  const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);

  const currentExpenses = getExpensesByCategory(
    transactions.filter(t => t.date.startsWith(currentMonth))
  );
  const lastMonthExpenses = getExpensesByCategory(
    transactions.filter(t => t.date.startsWith(lastMonth))
  );

  Object.keys(currentExpenses).forEach(category => {
    const current = currentExpenses[category];
    const previous = lastMonthExpenses[category] || 0;
    
    if (previous > 0) {
      const increase = ((current - previous) / previous) * 100;
      if (increase > 30) {
        alerts.push(
          `Your ${category} spending increased ${increase.toFixed(0)}% compared to last month.`
        );
      }
    }
  });

  return alerts;
};

export const detectWastefulExpenses = (transactions: Transaction[]): Array<{
  category: string;
  amount: number;
  description: string;
}> => {
  const wastefulKeywords = [
    'impulse',
    'unnecessary',
    'food delivery',
    'late night',
    'subscription',
    'unused',
  ];

  const currentMonth = new Date().toISOString().slice(0, 7);
  const expenses = transactions.filter(
    t => t.type === 'expense' && t.date.startsWith(currentMonth)
  );

  // Identify frequent small expenses that add up
  const categoryFrequency: Record<string, { count: number; total: number }> = {};
  
  expenses.forEach(t => {
    const key = t.category;
    if (!categoryFrequency[key]) {
      categoryFrequency[key] = { count: 0, total: 0 };
    }
    categoryFrequency[key].count++;
    categoryFrequency[key].total += t.amount;
  });

  const wasteful: Array<{ category: string; amount: number; description: string }> = [];

  // High frequency, low value expenses (potential wasteful spending)
  Object.entries(categoryFrequency).forEach(([category, data]) => {
    if (category === 'Food & Dining' && data.count > 15) {
      wasteful.push({
        category,
        amount: data.total,
        description: `${data.count} food expenses this month. Consider meal planning.`,
      });
    }
    if (category === 'Entertainment' && data.total > 300) {
      wasteful.push({
        category,
        amount: data.total,
        description: 'High entertainment spending. Review subscriptions.',
      });
    }
  });

  return wasteful;
};

export const calculateFinancialHealthScore = (): FinancialHealthScore => {
  const transactions = getTransactions();
  const budgets = getBudgets();
  const goals = getGoals();

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));

  const income = getTotalIncome(monthTransactions);
  const expenses = getTotalExpenses(monthTransactions);
  const savings = income - expenses;

  // 1. Savings Ratio (30 points)
  const savingsRatio = income > 0 ? Math.min((savings / income) * 100, 30) : 0;

  // 2. Budget Adherence (30 points)
  const currentBudgets = budgets.filter(b => b.month === currentMonth);
  let budgetScore = 30;
  currentBudgets.forEach(b => {
    if (b.spent > b.limit) {
      budgetScore -= 5;
    }
  });
  budgetScore = Math.max(budgetScore, 0);

  // 3. Expense Volatility (20 points) - lower volatility is better
  const last3Months = getMonthlyTrend(transactions, 3);
  const expenseValues = last3Months.map(m => m.expenses);
  const avgExpense = expenseValues.reduce((a, b) => a + b, 0) / expenseValues.length;
  const variance = expenseValues.reduce((sum, val) => sum + Math.pow(val - avgExpense, 2), 0) / expenseValues.length;
  const volatility = avgExpense > 0 ? (variance / avgExpense) : 0;
  const volatilityScore = Math.max(20 - volatility * 10, 0);

  // 4. Goal Consistency (20 points)
  let goalScore = 0;
  goals.forEach(goal => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    goalScore += Math.min(progress / goals.length, 20 / goals.length);
  });

  const totalScore = Math.round(savingsRatio + budgetScore + volatilityScore + goalScore);

  return {
    score: Math.min(totalScore, 100),
    savingsRatio: Math.round(savingsRatio),
    budgetAdherence: Math.round(budgetScore),
    expenseVolatility: Math.round(volatilityScore),
    goalConsistency: Math.round(goalScore),
  };
};

export const suggestBudget = (category: string): number => {
  const transactions = getTransactions();
  const last3Months = transactions.filter(t => {
    const date = new Date(t.date);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return date >= threeMonthsAgo && t.type === 'expense' && t.category === category;
  });

  if (last3Months.length === 0) return 500; // default suggestion

  const total = last3Months.reduce((sum, t) => sum + t.amount, 0);
  const average = total / 3;
  
  // Suggest 10% buffer
  return Math.round(average * 1.1);
};
