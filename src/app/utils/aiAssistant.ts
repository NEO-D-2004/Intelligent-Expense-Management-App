import { getTransactions, getBudgets, getGoals, getUser } from './storage';
import {
  getTotalIncome,
  getTotalExpenses,
  getExpensesByCategory,
  calculateFinancialHealthScore,
  detectSpendingSpikes,
  detectWastefulExpenses,
} from './analytics';

const FINANCIAL_TIPS = [
  "Track every expense, no matter how small. Small expenses add up!",
  "Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings.",
  "Automate your savings by setting up automatic transfers.",
  "Review subscriptions monthly - cancel what you don't use.",
  "Use the 24-hour rule: wait a day before making non-essential purchases.",
  "Cook at home more often - dining out is a major expense category.",
  "Set specific, measurable savings goals to stay motivated.",
  "Build an emergency fund covering 3-6 months of expenses.",
  "Pay off high-interest debt first (avalanche method).",
  "Use cash for discretionary spending to limit impulse buys.",
  "Negotiate your bills (internet, insurance) annually.",
  "Buy generic brands for household items and medication.",
];

const getRandomTip = () => FINANCIAL_TIPS[Math.floor(Math.random() * FINANCIAL_TIPS.length)];

const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

export const processQuery = (query: string): string => {
  const lowerQuery = query.toLowerCase();
  const transactions = getTransactions();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const lastMonthDate = new Date();
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  const lastMonth = lastMonthDate.toISOString().slice(0, 7);

  const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
  const lastMonthTransactions = transactions.filter(t => t.date.startsWith(lastMonth));

  // Greeting
  if (lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
    return "Hello! I'm your AI Financial Assistant. Ask me about your spending, budget, or savings goals!";
  }

  // Help
  if (lowerQuery.includes('help')) {
    return `I can help you with:
    
• "How much did I spend on [category] last month?"
• "What's my largest expense?"
• "Show me my recurring bills"
• "Am I overspending?"
• "What's my financial health score?"
• "Give me a financial tip"`;
  }

  // Largest Expense
  if (lowerQuery.includes('largest expense') || lowerQuery.includes('biggest spend')) {
    const expenses = monthTransactions.filter(t => t.type === 'expense');
    if (expenses.length === 0) return "You haven't recorded any expenses this month.";

    const largest = expenses.reduce((prev, current) => (prev.amount > current.amount) ? prev : current);
    return `Your largest expense this month was ${formatCurrency(largest.amount)} for "${largest.description}" (${largest.category}) on ${largest.date}.`;
  }

  // Recurring Transactions
  if (lowerQuery.includes('recurring') || lowerQuery.includes('subscription')) {
    const recurring = transactions.filter(t => t.isRecurring && t.type === 'expense');
    if (recurring.length === 0) return "You don't have any recurring expenses set up.";

    const totalRecurring = recurring.reduce((sum, t) => sum + t.amount, 0);
    let response = `You have ${recurring.length} recurring expenses totaling ${formatCurrency(totalRecurring)}/month:\n\n`;
    const unique = new Map();
    recurring.forEach(t => {
      if (!unique.has(t.description)) unique.set(t.description, t);
    });

    unique.forEach(t => {
      response += `• ${t.description}: ${formatCurrency(t.amount)} (${t.recurringInterval})\n`;
    });
    return response;
  }

  // Spending by category (Time-aware)
  if (lowerQuery.includes('spend') || lowerQuery.includes('spent')) {
    const targetTransactions = lowerQuery.includes('last month') ? lastMonthTransactions : monthTransactions;
    const periodName = lowerQuery.includes('last month') ? 'last month' : 'this month';

    // Total spending
    if (lowerQuery.includes('total') || lowerQuery.includes('how much did i spend')) {
      const total = getTotalExpenses(targetTransactions);
      return `You spent a total of ${formatCurrency(total)} ${periodName}.`;
    }

    // Category specific
    const categories = ['food', 'transport', 'entertainment', 'bills', 'shopping', 'healthcare', 'salary', 'income'];
    for (const cat of categories) {
      if (lowerQuery.includes(cat)) {
        const expenses = getExpensesByCategory(targetTransactions);
        const fullCategory = Object.keys(expenses).find(k => k.toLowerCase().includes(cat));

        if (fullCategory) {
          return `You spent ${formatCurrency(expenses[fullCategory])} on ${fullCategory} ${periodName}.`;
        } else {
          return `You didn't spend anything on ${cat} ${periodName}.`;
        }
      }
    }
  }

  // Budget status
  if (lowerQuery.includes('budget')) {
    const budgets = getBudgets().filter(b => b.month === currentMonth);
    if (budgets.length === 0) {
      return "You haven't set any budgets for this month yet.";
    }

    let response = 'Your budget status:\n\n';
    budgets.forEach(b => {
      const percentage = (b.spent / b.limit) * 100;
      const status = percentage > 100 ? '⚠️ Over budget!' : percentage > 80 ? '⚡ Close to limit' : '✅ On track';
      response += `• ${b.category}: $${b.spent}/$${b.limit} (${percentage.toFixed(0)}%) ${status}\n`;
    });
    return response;
  }

  // Overspending check
  if (lowerQuery.includes('overspend') || lowerQuery.includes('spending too much')) {
    const spikes = detectSpendingSpikes(transactions);
    const wasteful = detectWastefulExpenses(transactions);

    if (spikes.length === 0 && wasteful.length === 0) {
      return "Good news! Your spending patterns look healthy. Keep it up!";
    }

    let response = '';
    if (spikes.length > 0) {
      response += '⚠️ Spending alerts:\n\n';
      spikes.forEach(spike => {
        response += `• ${spike}\n`;
      });
    }

    if (wasteful.length > 0) {
      response += '\n💡 Potential savings opportunities:\n\n';
      wasteful.forEach(w => {
        response += `• ${w.category}: $${w.amount.toFixed(2)} - ${w.description}\n`;
      });
    }

    return response;
  }

  // Financial health score
  if (lowerQuery.includes('health')) {
    const score = calculateFinancialHealthScore();
    let rating = '';
    if (score.score >= 80) rating = 'Excellent! 🌟';
    else if (score.score >= 60) rating = 'Good 👍';
    else if (score.score >= 40) rating = 'Fair ⚠️';
    else rating = 'Needs Improvement 📉';

    return `Your Financial Health Score: ${score.score}/100 - ${rating}\n\nSavings Ratio: ${score.savingsRatio}/30\nBudget Adherence: ${score.budgetAdherence}/30\nExpense Stability: ${score.expenseVolatility}/20\nGoal Progress: ${score.goalConsistency}/20`;
  }

  // Savings goals
  if (lowerQuery.includes('goal')) {
    const goals = getGoals();
    if (goals.length === 0) return "You haven't set any savings goals yet.";

    let response = 'Your savings goals:\n\n';
    goals.forEach(goal => {
      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      response += `• ${goal.name}: ${formatCurrency(goal.currentAmount)}/${formatCurrency(goal.targetAmount)} (${progress.toFixed(0)}%)\n`;
    });
    return response;
  }

  // Tips
  if (lowerQuery.includes('tip') || lowerQuery.includes('advice')) {
    return `💡 Financial Tip: ${getRandomTip()}`;
  }

  // Default response
  return `I'm not sure how to help with that. Try asking:\n\n• "What's my largest expense?"\n• "How much did I spend on food?"\n• "Show my budget"\n• "Give me a tip"`;
};
