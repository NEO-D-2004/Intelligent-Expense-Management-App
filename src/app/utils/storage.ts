import { User, Transaction, Budget, SavingsGoal } from '../types';
import { sendBudgetAlert } from './notifications';

const STORAGE_KEYS = {
  USER: 'expense_tracker_user',
  TRANSACTIONS: 'expense_tracker_transactions',
  BUDGETS: 'expense_tracker_budgets',
  GOALS: 'expense_tracker_goals',
  IS_LOGGED_IN: 'expense_tracker_logged_in',
};

// User operations
export const saveUser = (user: User) => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
};

export const getUser = (): User | null => {
  const userStr = localStorage.getItem(STORAGE_KEYS.USER);
  return userStr ? JSON.parse(userStr) : null;
};

export const isLoggedIn = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
};

// Transaction operations
export const saveTransactions = (transactions: Transaction[]) => {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

export const getTransactions = (): Transaction[] => {
  const transactionsStr = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  return transactionsStr ? JSON.parse(transactionsStr) : [];
};

export const addTransaction = (transaction: Transaction) => {
  const transactions = getTransactions();
  transactions.push(transaction);
  saveTransactions(transactions);
  checkBudgetAlerts(transaction);
};

export const updateTransaction = (id: string, updatedTransaction: Transaction) => {
  const transactions = getTransactions();
  const index = transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    transactions[index] = updatedTransaction;
    saveTransactions(transactions);
    checkBudgetAlerts(updatedTransaction);
  }
};

export const deleteTransaction = (id: string) => {
  const transactions = getTransactions();
  const filtered = transactions.filter(t => t.id !== id);
  saveTransactions(filtered);
};

// Check for budget alerts
export const checkBudgetAlerts = (transaction: Transaction) => {
  if (transaction.type !== 'expense') return;

  const budgets = getBudgets();
  const budget = budgets.find(b => b.category === transaction.category); // Simple matching for now

  if (budget) {
    // Calculate total spent for this category in the current month
    // Note: The 'budget.spent' field in the Budget interface seems to be a pre-calculated value? 
    // Or is it supposed to be dynamic? 
    // Looking at the demo data, 'spent' is hardcoded. 
    // Ideally, we should recalculate 'spent' based on transactions.
    // Let's do a quick calculation here to be accurate.

    // Extract month from transaction date (YYYY-MM)
    const transactionMonth = transaction.date.substring(0, 7);

    // Only check if the transaction matches the budget's month
    if (budget.month === transactionMonth) {
      const transactions = getTransactions();
      const totalSpent = transactions
        .filter(t => t.type === 'expense' && t.category === transaction.category && t.date.startsWith(transactionMonth))
        .reduce((sum, t) => sum + t.amount, 0);

      // Check if exceeded 80%
      if (totalSpent >= budget.limit * 0.8) {
        sendBudgetAlert(budget, totalSpent);
      }
    }
  }
};

// Budget operations
export const saveBudgets = (budgets: Budget[]) => {
  localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
};

export const getBudgets = (): Budget[] => {
  const budgetsStr = localStorage.getItem(STORAGE_KEYS.BUDGETS);
  return budgetsStr ? JSON.parse(budgetsStr) : [];
};

export const addBudget = (budget: Budget) => {
  const budgets = getBudgets();
  budgets.push(budget);
  saveBudgets(budgets);
};

export const updateBudget = (id: string, updatedBudget: Budget) => {
  const budgets = getBudgets();
  const index = budgets.findIndex(b => b.id === id);
  if (index !== -1) {
    budgets[index] = updatedBudget;
    saveBudgets(budgets);
  }
};

// Goals operations
export const saveGoals = (goals: SavingsGoal[]) => {
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
};

export const getGoals = (): SavingsGoal[] => {
  const goalsStr = localStorage.getItem(STORAGE_KEYS.GOALS);
  return goalsStr ? JSON.parse(goalsStr) : [];
};

export const addGoal = (goal: SavingsGoal) => {
  const goals = getGoals();
  goals.push(goal);
  saveGoals(goals);
};

export const updateGoal = (id: string, updatedGoal: SavingsGoal) => {
  const goals = getGoals();
  const index = goals.findIndex(g => g.id === id);
  if (index !== -1) {
    goals[index] = updatedGoal;
    saveGoals(goals);
  }
};

export const deleteGoal = (id: string) => {
  const goals = getGoals();
  const filtered = goals.filter(g => g.id !== id);
  saveGoals(filtered);
};

// Migration to ensure data consistency
const migrateData = () => {
  const transactions = getTransactions();
  let hasChanges = false;

  const migratedTransactions = transactions.map(t => {
    if (t.isRecurring && !t.recurringInterval) {
      hasChanges = true;
      return { ...t, recurringInterval: 'monthly' as const };
    }
    return t;
  });

  if (hasChanges) {
    saveTransactions(migratedTransactions);
    console.log('Migrated transactions to include recurringInterval');
  }
};

export const initializeDemoData = () => {
  if (!isLoggedIn()) return;

  // Run migrations first
  migrateData();

  const transactions = getTransactions();
  if (transactions.length === 0) {
    const demoTransactions: Transaction[] = [
      {
        id: '1',
        type: 'income',
        amount: 5000,
        category: 'Salary',
        description: 'Monthly Salary',
        date: '2026-02-01',
        tags: ['salary'],
        isRecurring: true,
        recurringInterval: 'monthly',
      },
      {
        id: '2',
        type: 'expense',
        amount: 450,
        category: 'Food & Dining',
        description: 'Grocery shopping',
        date: '2026-02-15',
        tags: ['groceries'],
        isRecurring: false,
      },
      {
        id: '3',
        type: 'expense',
        amount: 80,
        category: 'Transportation',
        description: 'Uber rides',
        date: '2026-02-14',
        tags: ['transport'],
        isRecurring: false,
      },
      {
        id: '4',
        type: 'expense',
        amount: 200,
        category: 'Bills & Utilities',
        description: 'Electricity bill',
        date: '2026-02-10',
        tags: ['utilities'],
        isRecurring: true,
        recurringInterval: 'monthly',
      },
      {
        id: '5',
        type: 'expense',
        amount: 120,
        category: 'Entertainment',
        description: 'Netflix, Spotify subscriptions',
        date: '2026-02-05',
        tags: ['subscriptions'],
        isRecurring: true,
        recurringInterval: 'monthly',
      },
    ];
    saveTransactions(demoTransactions);
  }

  const budgets = getBudgets();
  if (budgets.length === 0) {
    const demoBudgets: Budget[] = [
      {
        id: '1',
        category: 'Food & Dining',
        limit: 600,
        month: '2026-02',
        spent: 450,
      },
      {
        id: '2',
        category: 'Transportation',
        limit: 200,
        month: '2026-02',
        spent: 80,
      },
      {
        id: '3',
        category: 'Entertainment',
        limit: 150,
        month: '2026-02',
        spent: 120,
      },
    ];
    saveBudgets(demoBudgets);
  }

  const goals = getGoals();
  if (goals.length === 0) {
    const demoGoals: SavingsGoal[] = [
      {
        id: '1',
        name: 'Emergency Fund',
        targetAmount: 10000,
        currentAmount: 3500,
        deadline: '2026-12-31',
        createdAt: '2026-01-01',
      },
      {
        id: '2',
        name: 'Vacation to Europe',
        targetAmount: 5000,
        currentAmount: 1200,
        deadline: '2026-08-01',
        createdAt: '2026-01-15',
      },
    ];
    saveGoals(demoGoals);
  }
};
