import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { getGoals, addGoal, updateGoal, deleteGoal } from '../utils/storage';
import { SavingsGoal } from '../types';
import { Target, Plus, Trash2, TrendingUp, Calendar, DollarSign, Trophy } from 'lucide-react';
import { toast } from 'sonner';

export function Goals() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = () => {
    const data = getGoals();
    setGoals(data.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.targetAmount || !formData.deadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    const goal: SavingsGoal = {
      id: Date.now().toString(),
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount) || 0,
      deadline: formData.deadline,
      createdAt: new Date().toISOString(),
    };

    addGoal(goal);
    loadGoals();
    setIsDialogOpen(false);
    resetForm();
    toast.success('Savings goal created successfully!');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: '',
      deadline: '',
    });
  };

  const handleAddFunds = (goalId: string, amount: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      const updatedGoal = {
        ...goal,
        currentAmount: goal.currentAmount + amount,
      };
      updateGoal(goalId, updatedGoal);
      loadGoals();
      toast.success(`Added $${amount} to ${goal.name}!`);
    }
  };

  const handleDeleteGoal = (goalId: string, goalName: string) => {
    if (confirm(`Are you sure you want to delete the goal "${goalName}"?`)) {
      deleteGoal(goalId);
      loadGoals();
      toast.success('Goal deleted successfully');
    }
  };

  const calculateMonthlyRequired = (goal: SavingsGoal) => {
    const remaining = goal.targetAmount - goal.currentAmount;
    const deadline = new Date(goal.deadline);
    const now = new Date();
    const monthsLeft = Math.max(
      Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)),
      1
    );
    return remaining / monthsLeft;
  };

  const getDaysLeft = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    return Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Savings Goals</h1>
          <p className="text-gray-600 mt-1">Set targets and track your progress toward financial milestones</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Savings Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Goal Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Emergency Fund, Vacation"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Amount ($)</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentAmount">Current Amount ($)</Label>
                <Input
                  id="currentAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Target Date</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Create Goal
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-gray-500">
            <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Savings Goals Yet</h3>
            <p className="mb-4">Start building your financial future by setting a savings goal!</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const isComplete = progress >= 100;
            const monthlyRequired = calculateMonthlyRequired(goal);
            const daysLeft = getDaysLeft(goal.deadline);
            const isOverdue = daysLeft < 0;

            return (
              <Card key={goal.id} className={isComplete ? 'border-green-500 bg-green-50' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {isComplete && <Trophy className="w-5 h-5 text-green-600" />}
                        {goal.name}
                      </CardTitle>
                      {isComplete && (
                        <Badge className="mt-2 bg-green-600">Goal Achieved! 🎉</Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteGoal(goal.id, goal.name)}
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Progress</span>
                      <span className="text-gray-600">
                        ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                      </span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-3" />
                    <p className="text-xs text-gray-500 mt-1">{progress.toFixed(1)}% complete</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500">Deadline</div>
                        <div className="text-sm font-medium">
                          {new Date(goal.deadline).toLocaleDateString()}
                        </div>
                        <div className={`text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                          {isOverdue ? 'Overdue' : `${daysLeft} days left`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500">Remaining</div>
                        <div className="text-sm font-medium">
                          ${(goal.targetAmount - goal.currentAmount).toFixed(2)}
                        </div>
                        {!isComplete && (
                          <div className="text-xs text-blue-600">
                            ${monthlyRequired.toFixed(2)}/month
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Add Buttons */}
                  {!isComplete && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500 mb-2">Quick Add:</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddFunds(goal.id, 50)}
                          className="flex-1"
                        >
                          +$50
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddFunds(goal.id, 100)}
                          className="flex-1"
                        >
                          +$100
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddFunds(goal.id, 500)}
                          className="flex-1"
                        >
                          +$500
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tips Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <DollarSign className="w-5 h-5" />
            Savings Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <p>💡 Set realistic, specific goals with clear deadlines</p>
          <p>💡 Automate your savings by setting up automatic transfers</p>
          <p>💡 Track progress regularly to stay motivated</p>
          <p>💡 Celebrate milestones along the way</p>
          <p>💡 Review and adjust goals as your financial situation changes</p>
        </CardContent>
      </Card>
    </div>
  );
}
