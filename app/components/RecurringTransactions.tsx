'use client';

import React, { useState, useEffect } from 'react';
import { RecurringTransaction, Frequency, Category, TransactionType } from '../types';
import { Calendar, Repeat, DollarSign, Tag, Plus, Trash2, Edit2, Power, PowerOff } from 'lucide-react';

const RecurringTransactions: React.FC = () => {
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    type: 'expense' as TransactionType,
    amount: '',
    category: 'Bills' as Category,
    description: '',
    frequency: 'monthly' as Frequency,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    isActive: true,
  });

  useEffect(() => {
    fetchRecurringTransactions();
  }, []);

  const fetchRecurringTransactions = async () => {
    try {
      const response = await fetch('/api/recurring-transactions');
      if (response.ok) {
        const data = await response.json();
        setRecurringTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching recurring transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingTransaction
        ? `/api/recurring-transactions/${editingTransaction.id}`
        : '/api/recurring-transactions';
      
      const method = editingTransaction ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchRecurringTransactions();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving recurring transaction:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recurring transaction?')) return;
    
    try {
      const response = await fetch(`/api/recurring-transactions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchRecurringTransactions();
      }
    } catch (error) {
      console.error('Error deleting recurring transaction:', error);
    }
  };

  const toggleActive = async (transaction: RecurringTransaction) => {
    try {
      const response = await fetch(`/api/recurring-transactions/${transaction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !transaction.isActive }),
      });

      if (response.ok) {
        fetchRecurringTransactions();
      }
    } catch (error) {
      console.error('Error toggling transaction:', error);
    }
  };

  const handleEdit = (transaction: RecurringTransaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.category,
      description: transaction.description,
      frequency: transaction.frequency,
      startDate: new Date(transaction.startDate).toISOString().split('T')[0],
      endDate: transaction.endDate ? new Date(transaction.endDate).toISOString().split('T')[0] : '',
      isActive: transaction.isActive,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      type: 'expense',
      amount: '',
      category: 'Bills',
      description: '',
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      isActive: true,
    });
    setEditingTransaction(null);
    setShowForm(false);
  };

  const frequencyLabels: Record<Frequency, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
  };

  if (loading) {
    return <div className="text-center py-8">Loading recurring transactions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Recurring Transactions</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} />
          Add Recurring Transaction
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">
            {editingTransaction ? 'Edit' : 'New'} Recurring Transaction
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as TransactionType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {formData.type === 'income' ? (
                    <>
                      <option value="Salary">Salary</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Investment">Investment</option>
                      <option value="Other Income">Other Income</option>
                    </>
                  ) : (
                    <>
                      <option value="Bills">Bills</option>
                      <option value="Food">Food</option>
                      <option value="Transportation">Transportation</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Other Expense">Other Expense</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as Frequency })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Netflix Subscription"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {editingTransaction ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {recurringTransactions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Repeat className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-500 text-lg">No recurring transactions yet</p>
            <p className="text-gray-400 text-sm mt-2">Set up automatic transactions for subscriptions and regular income</p>
          </div>
        ) : (
          recurringTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className={`bg-white rounded-lg shadow-sm p-5 border border-gray-200 ${
                !transaction.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        transaction.type === 'income'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      <Repeat size={14} />
                      {frequencyLabels[transaction.frequency]}
                    </span>
                    {!transaction.isActive && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {transaction.description || transaction.category}
                  </h3>
                  
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Tag size={14} />
                      {transaction.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      Starts {new Date(transaction.startDate).toLocaleDateString()}
                    </span>
                    {transaction.endDate && (
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        Ends {new Date(transaction.endDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => toggleActive(transaction)}
                    className={`p-2 rounded-lg transition-colors ${
                      transaction.isActive
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                    title={transaction.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {transaction.isActive ? <Power size={18} /> : <PowerOff size={18} />}
                  </button>
                  <button
                    onClick={() => handleEdit(transaction)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => transaction.id && handleDelete(transaction.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecurringTransactions;
