import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Camera } from 'lucide-react';
import { toast } from 'sonner';
import { addTransaction, updateTransaction } from '../utils/storage';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../types';
import { captureReceipt } from '../utils/camera';
import { useCurrency } from '../hooks/useCurrency';

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTransaction?: Transaction | null;
  onSuccess?: () => void;
}

export function AddTransactionDialog({ open, onOpenChange, editingTransaction, onSuccess }: AddTransactionDialogProps) {
  const { currencySymbol, convertAmount, convertToBase } = useCurrency();
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
    if (editingTransaction) {
      setFormData({
        type: editingTransaction.type,
        amount: convertAmount(editingTransaction.amount).toFixed(2),
        category: editingTransaction.category,
        description: editingTransaction.description,
        date: editingTransaction.date,
        tags: editingTransaction.tags.join(', '),
        isRecurring: editingTransaction.isRecurring,
        recurringInterval: editingTransaction.recurringInterval || 'monthly',
        receiptUrl: editingTransaction.receiptUrl || '',
      });
    } else {
      setFormData({
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
    }
  }, [editingTransaction, open]);

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

    // Trigger global refresh
    window.dispatchEvent(new CustomEvent('transaction-updated'));

    onSuccess?.();
    onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'income' | 'expense') =>
                setFormData({ ...formData, type: value, category: '' })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount ({currencySymbol})</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="What was this for?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              placeholder="work, travel, gifts"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="recurring"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="recurring" className="cursor-pointer">
              Recurring transaction
            </Label>
          </div>

          {formData.isRecurring && (
            <div className="space-y-2 pl-6 border-l-2 border-gray-200">
              <Label>Recurrence Interval</Label>
              <Select
                value={formData.recurringInterval}
                onValueChange={(value) => setFormData({ ...formData, recurringInterval: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Receipt</Label>
            <div className="flex items-center gap-4">
              <Button type="button" variant="outline" onClick={handleCaptureReceipt}>
                <Camera className="w-4 h-4 mr-2" />
                {formData.receiptUrl ? 'Change Receipt' : 'Attach Receipt'}
              </Button>
              {formData.receiptUrl && (
                <div className="text-sm text-green-600 flex items-center">
                  ✓ Receipt Attached
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {editingTransaction ? 'Update' : 'Add'} Transaction
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
