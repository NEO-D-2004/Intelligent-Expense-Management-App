import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from '../utils/storage';
import { AddTransactionDialog } from '../components/AddTransactionDialog';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../types';
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, Calendar, Filter, Camera, Search } from 'lucide-react';
import { toast } from 'sonner';
import { captureReceipt } from '../utils/camera';
import { useCurrency } from '../hooks/useCurrency';

export function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { formatCurrency, currencySymbol, convertAmount, convertToBase } = useCurrency();

  // Form state
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    tags: '',
    isRecurring: false,
    recurringInterval: 'monthly',
    receiptUrl: '',
  });

  useEffect(() => {
    loadTransactions();
    
    // Listen for global updates (from FAB)
    window.addEventListener('transaction-updated', loadTransactions);
    return () => window.removeEventListener('transaction-updated', loadTransactions);
  }, []);

  useEffect(() => {
    filterTransactionList();
  }, [transactions, filterType, filterCategory, searchQuery]);

  const loadTransactions = () => {
    const data = getTransactions();
    setTransactions(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const filterTransactionList = () => {
    let filtered = [...transactions];

    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === filterCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.description.toLowerCase().includes(query) ||
          t.tags.some(tag => tag.toLowerCase().includes(query)) ||
          t.category.toLowerCase().includes(query)
      );
    }

    setFilteredTransactions(filtered);
  };

  const resetForm = () => {
    setFormData({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      tags: '',
      isRecurring: false,
      recurringInterval: 'monthly',
      receiptUrl: '',
    });
    setEditingTransaction(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.category || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const transaction: Transaction = {
      id: editingTransaction?.id || Date.now().toString(),
      type: formData.type,
      amount: convertToBase(parseFloat(formData.amount)),
      category: formData.category,
      description: formData.description,
      date: formData.date,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      isRecurring: formData.isRecurring,
      recurringInterval: formData.isRecurring ? (formData.recurringInterval as 'daily' | 'weekly' | 'monthly' | 'yearly') : undefined,
      receiptUrl: formData.receiptUrl,
    };

    if (editingTransaction) {
      updateTransaction(transaction.id, transaction);
      toast.success('Transaction updated successfully');
    } else {
      addTransaction(transaction);
      toast.success('Transaction added successfully');
    }

    loadTransactions();
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: convertAmount(transaction.amount).toFixed(2),
      category: transaction.category,
      description: transaction.description,
      date: transaction.date,
      tags: transaction.tags.join(', '),
      isRecurring: transaction.isRecurring,
      recurringInterval: transaction.recurringInterval || 'monthly',
      receiptUrl: transaction.receiptUrl || '',
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id);
      loadTransactions();
      toast.success('Transaction deleted successfully');
    }
  };

  const handleCaptureReceipt = async () => {
    try {
      const result = await captureReceipt();
      if (result) {
        setFormData({ ...formData, receiptUrl: result.filepath });
        toast.success('Receipt attached!');
      }
    } catch (error) {
      toast.error('Failed to capture receipt');
    }
  };

  const categories = formData.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">Track and manage all your income and expenses</p>
        </div>
        <div className="flex gap-2">
        <div className="flex gap-2">
          <Button onClick={() => {
            resetForm();
            setIsAddDialogOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
          
          <AddTransactionDialog 
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            editingTransaction={editingTransaction}
            onSuccess={loadTransactions}
          />
        </div>

        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search transactions by description, category, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label>Type</Label>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="income">Income Only</SelectItem>
                  <SelectItem value="expense">Expenses Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {[...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No transactions found</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => setIsAddDialogOpen(true)}>
                Add your first transaction
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          {transaction.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {transaction.tags.map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {transaction.receiptUrl && (
                            <div className="mt-1">
                              <Badge variant="outline" className="text-xs gap-1">
                                <Camera className="w-3 h-3" /> Receipt By ID
                              </Badge>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell>
                        <Badge
                          variant={transaction.type === 'income' ? 'default' : 'secondary'}
                          className="flex items-center gap-1 w-fit"
                        >
                          {transaction.type === 'income' ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(transaction)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(transaction.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
