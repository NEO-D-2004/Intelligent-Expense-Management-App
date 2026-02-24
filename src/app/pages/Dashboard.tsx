import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { getTransactions, getBudgets, getGoals, getUser } from '../utils/storage';
import {
  getTotalIncome,
  getTotalExpenses,
  getExpensesByCategory,
  calculateFinancialHealthScore,
  detectSpendingSpikes,
} from '../utils/analytics';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertCircle,
  ArrowRight,
  Wallet,
  PiggyBank,
} from 'lucide-react';

export function Dashboard() {
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [healthScore, setHealthScore] = useState(0);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);

    const transactions = getTransactions();
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));

    const totalIncome = getTotalIncome(monthTransactions);
    const totalExpenses = getTotalExpenses(monthTransactions);

    setIncome(totalIncome);
    setExpenses(totalExpenses);

    const currentBudgets = getBudgets().filter(b => b.month === currentMonth);
    setBudgets(currentBudgets);

    const currentGoals = getGoals();
    setGoals(currentGoals);

    const score = calculateFinancialHealthScore();
    setHealthScore(score.score);

    const spendingAlerts = detectSpendingSpikes(transactions);
    setAlerts(spendingAlerts);
  }, []);

  const savings = income - expenses;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.name || 'User'}! Here's your financial overview.</p>
      </div>

      {/* Financial Health Score */}
      <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <span>Financial Health Score</span>
            <Badge
              variant={healthScore >= 80 ? 'default' : healthScore >= 60 ? 'secondary' : 'destructive'}
              className="bg-white/20 text-white"
            >
              {healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : healthScore >= 40 ? 'Fair' : 'Poor'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="text-6xl font-bold">{healthScore}</div>
            <div className="text-2xl pb-2 opacity-80">/100</div>
          </div>
          <Progress value={healthScore} className="mt-4 h-2 bg-white/20" />
          <Link to="/analytics">
            <Button variant="ghost" className="mt-4 text-white hover:bg-white/10">
              View Detailed Analysis
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Income</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${income.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
            <TrendingDown className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${expenses.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Net Savings</CardTitle>
            <PiggyBank className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${savings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              ${savings.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">{savingsRate.toFixed(0)}% savings rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Goals</CardTitle>
            <Target className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{goals.length}</div>
            <p className="text-xs text-gray-500 mt-1">Savings targets</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="w-5 h-5" />
              Spending Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.slice(0, 3).map((alert, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-orange-700">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                <span>{alert}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Budget Overview</CardTitle>
            <Link to="/analytics">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Wallet className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No budgets set for this month</p>
                <Link to="/analytics">
                  <Button variant="outline" size="sm" className="mt-2">
                    Create Budget
                  </Button>
                </Link>
              </div>
            ) : (
              budgets.slice(0, 3).map((budget) => {
                const percentage = (budget.spent / budget.limit) * 100;
                const isOverBudget = percentage > 100;
                const isNearLimit = percentage > 80 && !isOverBudget;

                return (
                  <div key={budget.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{budget.category}</span>
                      <span className="text-sm text-gray-600">
                        ${budget.spent.toFixed(0)} / ${budget.limit.toFixed(0)}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(percentage, 100)}
                      className={`h-2 ${isOverBudget
                          ? 'bg-red-100'
                          : isNearLimit
                            ? 'bg-orange-100'
                            : 'bg-gray-100'
                        }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {percentage.toFixed(0)}% used
                      {isOverBudget && (
                        <span className="text-red-600 ml-2">• Over budget by ${(budget.spent - budget.limit).toFixed(0)}</span>
                      )}
                    </p>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Savings Goals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Savings Goals</CardTitle>
            <Link to="/goals">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No savings goals yet</p>
                <Link to="/goals">
                  <Button variant="outline" size="sm" className="mt-2">
                    Create Goal
                  </Button>
                </Link>
              </div>
            ) : (
              goals.slice(0, 3).map((goal) => {
                const percentage = (goal.currentAmount / goal.targetAmount) * 100;
                const deadline = new Date(goal.deadline);
                const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

                return (
                  <div key={goal.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{goal.name}</span>
                      <span className="text-sm text-gray-600">
                        ${goal.currentAmount.toFixed(0)} / ${goal.targetAmount.toFixed(0)}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      {percentage.toFixed(0)}% complete • {daysLeft} days left
                    </p>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/transactions">
            <Button variant="outline" className="w-full">
              <DollarSign className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </Link>
          <Link to="/analytics">
            <Button variant="outline" className="w-full">
              <Wallet className="w-4 h-4 mr-2" />
              Set Budget
            </Button>
          </Link>
          <Link to="/goals">
            <Button variant="outline" className="w-full">
              <Target className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </Link>
          <Link to="/assistant">
            <Button variant="outline" className="w-full">
              <AlertCircle className="w-4 h-4 mr-2" />
              Ask AI
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
