import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { getTransactions, getBudgets, addBudget, updateBudget } from '../utils/storage';
import {
  getExpensesByCategory,
  getMonthlyTrend,
  calculateFinancialHealthScore,
  detectWastefulExpenses,
  suggestBudget,
} from '../utils/analytics';
import { EXPENSE_CATEGORIES } from '../types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, AlertTriangle, Lightbulb, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#84cc16'];

export function Analytics() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);
  const [healthScore, setHealthScore] = useState<any>(null);
  const [wastefulExpenses, setWastefulExpenses] = useState<any[]>([]);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [budgetForm, setBudgetForm] = useState({
    category: '',
    limit: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const txns = getTransactions();
    setTransactions(txns);

    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthTransactions = txns.filter(t => t.date.startsWith(currentMonth));

    // Category breakdown
    const expensesByCategory = getExpensesByCategory(monthTransactions);
    const categoryChartData = Object.entries(expensesByCategory).map(([name, value]) => ({
      name,
      value,
    }));
    setCategoryData(categoryChartData);

    // Monthly trend
    const trend = getMonthlyTrend(txns, 6);
    setMonthlyTrend(trend);

    // Health score
    const score = calculateFinancialHealthScore();
    setHealthScore(score);

    // Wasteful expenses
    const wasteful = detectWastefulExpenses(txns);
    setWastefulExpenses(wasteful);

    // Budgets
    const currentBudgets = getBudgets().filter(b => b.month === currentMonth);
    setBudgets(currentBudgets);
  };

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();

    if (!budgetForm.category || !budgetForm.limit) {
      toast.error('Please fill in all fields');
      return;
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Check if budget already exists for this category
    const existing = budgets.find(b => b.category === budgetForm.category);
    
    if (existing) {
      updateBudget(existing.id, {
        ...existing,
        limit: parseFloat(budgetForm.limit),
      });
      toast.success('Budget updated successfully');
    } else {
      // Calculate current spending for this category
      const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
      const categoryExpenses = getExpensesByCategory(monthTransactions);
      const spent = categoryExpenses[budgetForm.category] || 0;

      addBudget({
        id: Date.now().toString(),
        category: budgetForm.category,
        limit: parseFloat(budgetForm.limit),
        month: currentMonth,
        spent,
      });
      toast.success('Budget created successfully');
    }

    loadData();
    setIsBudgetDialogOpen(false);
    setBudgetForm({ category: '', limit: '' });
  };

  const handleSuggestBudget = (category: string) => {
    const suggested = suggestBudget(category);
    setBudgetForm({ category, limit: suggested.toString() });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">Visualize your spending patterns and financial health</p>
        </div>
      </div>

      {/* Financial Health Score Breakdown */}
      {healthScore && (
        <Card>
          <CardHeader>
            <CardTitle>Financial Health Score Breakdown</CardTitle>
            <CardDescription>Understanding your {healthScore.score}/100 score</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Savings Ratio</span>
                <span className="text-sm text-gray-600">{healthScore.savingsRatio}/30</span>
              </div>
              <Progress value={(healthScore.savingsRatio / 30) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Budget Adherence</span>
                <span className="text-sm text-gray-600">{healthScore.budgetAdherence}/30</span>
              </div>
              <Progress value={(healthScore.budgetAdherence / 30) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Expense Stability</span>
                <span className="text-sm text-gray-600">{healthScore.expenseVolatility}/20</span>
              </div>
              <Progress value={(healthScore.expenseVolatility / 20) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Goal Progress</span>
                <span className="text-sm text-gray-600">{healthScore.goalConsistency}/20</span>
              </div>
              <Progress value={(healthScore.goalConsistency / 20) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wasteful Spending Alerts */}
      {wastefulExpenses.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="w-5 h-5" />
              Money Leakage Report
            </CardTitle>
            <CardDescription className="text-orange-700">
              Potential savings opportunities identified
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {wastefulExpenses.map((expense, index) => (
              <div key={index} className="flex items-start justify-between p-3 bg-white rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-orange-900">{expense.category}</div>
                  <div className="text-sm text-orange-700 mt-1">{expense.description}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-orange-600">${expense.amount.toFixed(2)}</div>
                  <div className="text-xs text-orange-500">potential savings</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="budget">Budget Control</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Expenses by Category</CardTitle>
                <CardDescription>Current month breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                {categoryData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No expense data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Category Spending Details</CardTitle>
                <CardDescription>Total amount per category</CardDescription>
              </CardHeader>
              <CardContent>
                {categoryData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No expense data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Create Budget
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Set Budget Limit</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddBudget} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={budgetForm.category}
                      onValueChange={(value) => setBudgetForm({ ...budgetForm, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPENSE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="limit">Monthly Limit ($)</Label>
                      {budgetForm.category && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSuggestBudget(budgetForm.category)}
                        >
                          <Lightbulb className="w-4 h-4 mr-1" />
                          Suggest
                        </Button>
                      )}
                    </div>
                    <Input
                      id="limit"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={budgetForm.limit}
                      onChange={(e) => setBudgetForm({ ...budgetForm, limit: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      Set Budget
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsBudgetDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgets.length === 0 ? (
              <Card className="col-span-2">
                <CardContent className="text-center py-12 text-gray-500">
                  <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No budgets set for this month</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setIsBudgetDialogOpen(true)}
                  >
                    Create your first budget
                  </Button>
                </CardContent>
              </Card>
            ) : (
              budgets.map((budget) => {
                const percentage = (budget.spent / budget.limit) * 100;
                const isOverBudget = percentage > 100;
                const isNearLimit = percentage > 80 && !isOverBudget;
                const remaining = budget.limit - budget.spent;

                return (
                  <Card key={budget.id} className={isOverBudget ? 'border-red-200' : isNearLimit ? 'border-orange-200' : ''}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{budget.category}</CardTitle>
                        <Badge
                          variant={isOverBudget ? 'destructive' : isNearLimit ? 'secondary' : 'default'}
                        >
                          {percentage.toFixed(0)}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Spent</span>
                        <span className="font-semibold">${budget.spent.toFixed(2)}</span>
                      </div>
                      <Progress
                        value={Math.min(percentage, 100)}
                        className={`h-3 ${
                          isOverBudget ? 'bg-red-100' : isNearLimit ? 'bg-orange-100' : ''
                        }`}
                      />
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Limit</span>
                        <span className="font-semibold">${budget.limit.toFixed(2)}</span>
                      </div>
                      <div className={`text-sm font-medium ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {remaining >= 0 ? `$${remaining.toFixed(2)} remaining` : `Over budget by $${Math.abs(remaining).toFixed(2)}`}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>6-Month Income vs Expenses Trend</CardTitle>
              <CardDescription>Track your financial trajectory over time</CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyTrend.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No trend data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
