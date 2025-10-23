'use client';

import React, { useState, useEffect } from 'react';
import { SavingsGoal } from '../types';
import { Target, Plus, Trash2, Edit2, TrendingUp, Calendar, DollarSign, X } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';

const SavingsGoals: React.FC = () => {
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionError, setContributionError] = useState('');
  const { getStats, refreshData } = useTransactions();

  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    category: '',
    description: '',
  });

  useEffect(() => {
    fetchSavingsGoals();
  }, []);

  const fetchSavingsGoals = async () => {
    try {
      const response = await fetch('/api/savings-goals');
      if (response.ok) {
        const data = await response.json();
        setSavingsGoals(data);
      }
    } catch (error) {
      console.error('Error fetching savings goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingGoal
        ? `/api/savings-goals/${editingGoal.id}`
        : '/api/savings-goals';
      
      const method = editingGoal ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchSavingsGoals();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving savings goal:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this savings goal?')) return;
    
    try {
      const response = await fetch(`/api/savings-goals/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchSavingsGoals();
      }
    } catch (error) {
      console.error('Error deleting savings goal:', error);
    }
  };

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
      category: goal.category || '',
      description: goal.description || '',
    });
    setShowForm(true);
  };

  const handleContribute = async (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setContributionAmount('');
    setContributionError('');
    setShowAddFundsModal(true);
  };

  const handleAddFunds = async () => {
    if (!selectedGoal) return;

    const amount = parseFloat(contributionAmount);

    // Validate amount
    if (!contributionAmount || isNaN(amount)) {
      setContributionError('Please enter a valid amount');
      return;
    }

    if (amount <= 0) {
      setContributionError('Amount must be greater than 0');
      return;
    }

    // Check if user has sufficient balance
    const stats = getStats();
    if (amount > stats.balance) {
      setContributionError(`Insufficient balance. Available: $${stats.balance.toFixed(2)}`);
      return;
    }

    const newAmount = selectedGoal.currentAmount + amount;
    
    try {
      // Update the savings goal
      const goalResponse = await fetch(`/api/savings-goals/${selectedGoal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentAmount: newAmount,
          isCompleted: newAmount >= selectedGoal.targetAmount,
        }),
      });

      if (!goalResponse.ok) {
        throw new Error('Failed to update savings goal');
      }

      // Create a transaction for this contribution
      const transactionResponse = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'expense',
          amount: amount,
          category: 'Other Expense',
          description: `Contribution to savings goal: ${selectedGoal.name}`,
          date: new Date().toISOString(),
        }),
      });

      if (!transactionResponse.ok) {
        throw new Error('Failed to create transaction');
      }

      // Refresh data
      await fetchSavingsGoals();
      await refreshData();
      
      // Close modal and reset state
      setShowAddFundsModal(false);
      setSelectedGoal(null);
      setContributionAmount('');
      setContributionError('');
    } catch (error) {
      console.error('Error adding funds:', error);
      setContributionError('Failed to add funds. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: '',
      deadline: '',
      category: '',
      description: '',
    });
    setEditingGoal(null);
    setShowForm(false);
  };

  const calculateProgress = (goal: SavingsGoal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  const getDaysRemaining = (deadline?: string) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return <div className="text-center py-8">Loading savings goals...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Savings Goals</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} />
          Add Savings Goal
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">
            {editingGoal ? 'Edit' : 'New'} Savings Goal
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Emergency Fund"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline (Optional)</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category (Optional)</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Vacation, Car, House"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Add notes about this goal..."
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
                {editingGoal ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savingsGoals.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-sm">
            <Target className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-500 text-lg">No savings goals yet</p>
            <p className="text-gray-400 text-sm mt-2">Start planning your financial goals today</p>
          </div>
        ) : (
          savingsGoals.map((goal) => {
            const progress = calculateProgress(goal);
            const daysRemaining = getDaysRemaining(goal.deadline);
            const isOverdue = daysRemaining !== null && daysRemaining < 0;
            
            return (
              <div
                key={goal.id}
                className={`bg-white rounded-lg shadow-md p-6 border-2 ${
                  goal.isCompleted
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800 mb-1">{goal.name}</h3>
                    {goal.category && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {goal.category}
                      </span>
                    )}
                  </div>
                  {goal.isCompleted && (
                    <span className="text-2xl">🎉</span>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold text-gray-800">{progress.toFixed(1)}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        goal.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <p className="text-gray-600">Current</p>
                      <p className="font-semibold text-gray-800">${goal.currentAmount.toFixed(2)}</p>
                    </div>
                    <div className="text-sm text-right">
                      <p className="text-gray-600">Target</p>
                      <p className="font-semibold text-gray-800">${goal.targetAmount.toFixed(2)}</p>
                    </div>
                  </div>

                  {goal.deadline && (
                    <div className={`flex items-center gap-2 text-sm ${
                      isOverdue ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      <Calendar size={14} />
                      {isOverdue ? (
                        <span>Overdue by {Math.abs(daysRemaining!)} days</span>
                      ) : (
                        <span>{daysRemaining} days remaining</span>
                      )}
                    </div>
                  )}

                  {goal.description && (
                    <p className="text-sm text-gray-600 italic">{goal.description}</p>
                  )}
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleContribute(goal)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                    disabled={goal.isCompleted}
                  >
                    <DollarSign size={16} />
                    Add Funds
                  </button>
                  <button
                    onClick={() => handleEdit(goal)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => goal.id && handleDelete(goal.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Funds Modal */}
      {showAddFundsModal && selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Add Funds to Goal</h3>
              <button
                onClick={() => {
                  setShowAddFundsModal(false);
                  setSelectedGoal(null);
                  setContributionAmount('');
                  setContributionError('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Contributing to: <span className="font-semibold text-gray-800">{selectedGoal.name}</span>
              </p>
              <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Amount:</span>
                  <span className="font-semibold">${selectedGoal.currentAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Target Amount:</span>
                  <span className="font-semibold">${selectedGoal.targetAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-semibold text-blue-600">
                    ${(selectedGoal.targetAmount - selectedGoal.currentAmount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-gray-600">Available Balance:</span>
                  <span className="font-semibold text-green-600">
                    ${getStats().balance.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contribution Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={contributionAmount}
                  onChange={(e) => {
                    setContributionAmount(e.target.value);
                    setContributionError('');
                  }}
                  className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    contributionError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                  autoFocus
                />
              </div>
              {contributionError && (
                <p className="text-red-500 text-sm mt-1">{contributionError}</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This amount will be deducted from your current balance and
                a transaction will be automatically created.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddFundsModal(false);
                  setSelectedGoal(null);
                  setContributionAmount('');
                  setContributionError('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFunds}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Add Funds
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsGoals;
