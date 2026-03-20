import React, { useState, useEffect } from 'react';
import type { Expense, ExpenseCategory } from '@/types';
import { apiAdapter } from '@/services/apiAdapter';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface ExpensesListProps {
  tripId: string;
  baseCurrency: string;
  onExpenseChange?: () => void;
  refreshKey?: number;
  showAddForm?: boolean;
  onAddFormChange?: (show: boolean) => void;
}

export const ExpensesList: React.FC<ExpensesListProps> = ({ 
  tripId, 
  baseCurrency, 
  onExpenseChange, 
  refreshKey = 0,
  showAddForm: externalShowAddForm,
  onAddFormChange,
}) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [internalShowAddForm, setInternalShowAddForm] = useState(false);
  const showAddForm = externalShowAddForm !== undefined ? externalShowAddForm : internalShowAddForm;
  const setShowAddForm = (value: boolean) => {
    if (onAddFormChange) {
      onAddFormChange(value);
    } else {
      setInternalShowAddForm(value);
    }
  };
  const [formData, setFormData] = useState({
    amount: '',
    category: 'other' as ExpenseCategory,
    description: '',
    isShared: true,
  });

  const fetchExpenses = async () => {
    try {
      const data = await apiAdapter.getExpenses(tripId);
      setExpenses(data);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [tripId, refreshKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiAdapter.createExpense(tripId, {
        ...formData,
        amount: parseFloat(formData.amount),
      });
      setShowAddForm(false);
      setFormData({
        amount: '',
        category: 'other',
        description: '',
        isShared: true,
      });
      fetchExpenses();
      onExpenseChange?.();
    } catch (error) {
      console.error('Failed to create expense:', error);
    }
  };

  const handleDelete = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await apiAdapter.deleteExpense(tripId, expenseId);
      fetchExpenses();
      onExpenseChange?.();
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  if (loading) {
    return <div className="text-gray-500 dark:text-gray-400">Loading expenses...</div>;
  }

  const sharedExpenses = expenses.filter(e => e.isShared);
  const personalExpenses = expenses.filter(e => !e.isShared);

  return (
    <div className="space-y-6">
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-4">
          <Input
            type="number"
            step="0.01"
            label="Amount"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
          <Select
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
            options={[
              { value: 'transport', label: 'Transport' },
              { value: 'accommodation', label: 'Accommodation' },
              { value: 'food', label: 'Food' },
              { value: 'activities', label: 'Activities' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isShared"
              checked={formData.isShared}
              onChange={(e) => setFormData({ ...formData, isShared: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="isShared" className="text-sm text-gray-700 dark:text-gray-300">
              Shared expense
            </label>
          </div>
          <Button type="submit">Add Expense</Button>
        </form>
      )}

      {sharedExpenses.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Shared Expenses</h4>
          <div className="space-y-2">
            {sharedExpenses.map(expense => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {baseCurrency} {expense.amount.toFixed(2)}
                    </span>
                    <span className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded">
                      {expense.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{expense.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {format(new Date(expense.timestamp), 'MMM d, yyyy HH:mm')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(expense.id)}
                  className="text-red-600 dark:text-red-400"
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {personalExpenses.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Personal Expenses</h4>
          <div className="space-y-2">
            {personalExpenses.map(expense => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {baseCurrency} {expense.amount.toFixed(2)}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                      {expense.category}
                    </span>
                    {expense.authorName && (
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                        by {expense.authorName}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{expense.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(expense.id)}
                  className="text-red-600 dark:text-red-400"
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {expenses.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">No expenses yet.</p>
      )}
    </div>
  );
};

