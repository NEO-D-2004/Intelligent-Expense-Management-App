import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { getUser, saveUser, logout, getTransactions } from '../utils/storage';
import { exportToCSV, exportToPDF } from '../utils/export';
import { User as UserIcon, DollarSign, Calendar, Database, AlertCircle, LogOut, FileText, FileSpreadsheet, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { auth } from '../utils/firebase';
import { signOut } from 'firebase/auth';

export function Profile() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error(error);
      toast.error('Logout failed');
    }
  };
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currency: 'USD',
    monthlyIncome: '',
    salaryDay: '1',
  });

  useEffect(() => {
    const user = getUser();
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        currency: user.currency,
        monthlyIncome: user.monthlyIncome.toString(),
        salaryDay: user.salaryDay.toString(),
      });
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const user = getUser();
    if (user) {
      const updatedUser = {
        ...user,
        name: formData.name,
        email: formData.email,
        currency: formData.currency,
        monthlyIncome: parseFloat(formData.monthlyIncome) || 0,
        salaryDay: parseInt(formData.salaryDay) || 1,
      };
      saveUser(updatedUser);
      toast.success('Settings saved successfully!');
    }
  };


  const handleExportCSV = async () => {
    const transactions = getTransactions();
    if (transactions.length === 0) {
      toast.error('No transactions to export');
      return;
    }
    const success = await exportToCSV(transactions);
    if (success) toast.success('CSV exported successfully');
    else toast.error('Failed to export CSV');
  };

  const handleExportPDF = async () => {
    const transactions = getTransactions();
    if (transactions.length === 0) {
      toast.error('No transactions to export');
      return;
    }
    const success = await exportToPDF(transactions);
    if (success) toast.success('PDF exported successfully');
    else toast.error('Failed to export PDF');
  };

  const handleExportJSON = () => {
    const data = {
      user: getUser(),
      transactions: localStorage.getItem('expense_tracker_transactions'),
      budgets: localStorage.getItem('expense_tracker_budgets'),
      goals: localStorage.getItem('expense_tracker_goals'),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup exported successfully!');
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      if (confirm('Really? All your transactions, budgets, and goals will be permanently deleted!')) {
        localStorage.removeItem('expense_tracker_transactions');
        localStorage.removeItem('expense_tracker_budgets');
        localStorage.removeItem('expense_tracker_goals');
        toast.success('All data cleared successfully');
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account and preferences</p>
        </div>
        <Button variant="destructive" onClick={handleLogout} className="w-full md:w-auto">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit">
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Financial Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Financial Configuration
          </CardTitle>
          <CardDescription>Configure your income and salary details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyIncome">Monthly Income ($)</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  step="0.01"
                  value={formData.monthlyIncome}
                  onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryDay">Salary Day (1-31)</Label>
                <Input
                  id="salaryDay"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.salaryDay}
                  onChange={(e) => setFormData({ ...formData, salaryDay: e.target.value })}
                  placeholder="1"
                />
              </div>
            </div>

            <Button type="submit">
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Management
          </CardTitle>
          <CardDescription>Export or clear your financial data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <Label>Export Data</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button variant="outline" onClick={handleExportCSV} className="flex items-center justify-center gap-2">
                <FileSpreadsheet className="w-4 h-4" /> CSV
              </Button>
              <Button variant="outline" onClick={handleExportPDF} className="flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" /> PDF
              </Button>
              <Button variant="outline" onClick={handleExportJSON} className="flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Backup JSON
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-900 mb-1">Danger Zone</h4>
                <p className="text-sm text-red-700 mb-3">
                  Clearing all data will permanently delete all your transactions, budgets, and goals. This action cannot be undone.
                </p>
                <Button variant="destructive" size="sm" onClick={handleClearData}>
                  Clear All Data
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            About
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>
            <strong>Expenzo</strong> - Intelligent Expense Monitoring Management System
          </p>
          <p>Version 1.0.0</p>
          <p className="pt-2 border-t">
            This application uses local storage to persist your financial data. All data is stored securely in your browser.
          </p>
          <p className="text-xs text-gray-500">
            For production use, consider integrating with a secure backend service for data synchronization and backup.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
