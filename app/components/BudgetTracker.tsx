'use client';

import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { Budget, Category } from '../types';
import { AlertTriangle, Plus, X, Trash2 } from 'lucide-react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';

const expenseCategories: Category[] = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Healthcare',
  'Education',
  'Other Expense',
];

const BudgetTracker: React.FC = () => {
  const { budgets, addBudget, deleteBudget, transactions } = useTransactions();
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState<Category>('Food');
  const [limit, setLimit] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'weekly'>('monthly');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!limit || parseFloat(limit) <= 0) {
      alert('Please enter a valid budget limit');
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      await addBudget({
        category,
        limit: parseFloat(limit),
        period,
      });

      setLimit('');
      setShowForm(false);
    } catch (error) {
      console.error('Error adding budget:', error);
      alert('Failed to add budget. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateSpending = (budget: Budget) => {
    const now = new Date();
    let start: Date, end: Date;

    if (budget.period === 'monthly') {
      start = startOfMonth(now);
      end = endOfMonth(now);
    } else {
      start = startOfWeek(now);
      end = endOfWeek(now);
    }

    const spending = transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          t.type === 'expense' &&
          t.category === budget.category &&
          transactionDate >= start &&
          transactionDate <= end
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);

    return spending;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Budget Tracker</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          <Plus size={18} />
          Add Budget
        </button>
      </div>

      {budgets.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No budgets set yet</p>
          <p className="text-gray-400 text-sm mt-2">Add a budget to track your spending</p>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => {
            const spending = calculateSpending(budget);
            const percentage = (spending / budget.limit) * 100;
            const isOverBudget = spending > budget.limit;
            const isNearLimit = percentage >= 80 && !isOverBudget;

            return (
              <div key={budget.category} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">{budget.category}</h4>
                    <p className="text-sm text-gray-500 capitalize">{budget.period}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${isOverBudget ? 'text-red-600' : 'text-gray-800'}`}>
                        ${spending.toFixed(2)} / ${budget.limit.toFixed(2)}
                      </p>
                      <p className={`text-sm ${isOverBudget ? 'text-red-500' : isNearLimit ? 'text-orange-500' : 'text-gray-500'}`}>
                        {percentage.toFixed(0)}% used
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        if (budget.id && window.confirm('Are you sure you want to delete this budget?')) {
                          try {
                            await deleteBudget(budget.id);
                          } catch (error) {
                            console.error('Error deleting budget:', error);
                            alert('Failed to delete budget. Please try again.');
                          }
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete budget"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isOverBudget
                        ? 'bg-red-500'
                        : isNearLimit
                        ? 'bg-orange-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>

                {/* Alert Messages */}
                {(isOverBudget || isNearLimit) && (
                  <div className={`mt-3 flex items-center gap-2 p-3 rounded-lg ${
                    isOverBudget ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'
                  }`}>
                    <AlertTriangle size={18} />
                    <p className="text-sm font-medium">
                      {isOverBudget
                        ? `Over budget by $${(spending - budget.limit).toFixed(2)}`
                        : 'Approaching budget limit'}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Budget Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Add Budget</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="budget-category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="budget-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {expenseCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="budget-limit" className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Limit ($)
                </label>
                <input
                  type="number"
                  id="budget-limit"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="budget-period" className="block text-sm font-medium text-gray-700 mb-2">
                  Period
                </label>
                <select
                  id="budget-period"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as 'monthly' | 'weekly')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Adding...' : 'Add Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetTracker;
