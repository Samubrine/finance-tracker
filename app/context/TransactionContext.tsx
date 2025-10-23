'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { Transaction, Budget, FilterOptions, Category } from '../types';

interface TransactionContextType {
  transactions: Transaction[];
  budgets: Budget[];
  loading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addBudget: (budget: Budget) => Promise<void>;
  updateBudget: (category: Category, budget: Budget) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  filterTransactions: (filters: FilterOptions) => Transaction[];
  getStats: () => { totalIncome: number; totalExpense: number; balance: number; transactionCount: number };
  refreshData: () => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};

interface TransactionProviderProps {
  children: ReactNode;
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch transactions from API
  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else if (response.status === 401) {
        // Unauthorized - user not logged in
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  // Fetch budgets from API
  const fetchBudgets = async () => {
    try {
      const response = await fetch('/api/budgets');
      if (response.ok) {
        const data = await response.json();
        setBudgets(data);
      } else if (response.status === 401) {
        // Unauthorized - user not logged in
        setBudgets([]);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  // Refresh all data
  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchTransactions(), fetchBudgets()]);
    setLoading(false);
  };

  // Load data from API only when authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      refreshData();
    } else if (status === 'unauthenticated') {
      setTransactions([]);
      setBudgets([]);
      setLoading(false);
    }
  }, [status]);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });

      if (response.ok) {
        const newTransaction = await response.json();
        setTransactions((prev) => [newTransaction, ...prev]);
      } else {
        throw new Error('Failed to add transaction');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const updateTransaction = async (id: string, transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });

      if (response.ok) {
        const updatedTransaction = await response.json();
        setTransactions((prev) =>
          prev.map((t) => (t.id === id ? updatedTransaction : t))
        );
      } else {
        throw new Error('Failed to update transaction');
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      } else {
        throw new Error('Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  };

  const addBudget = async (budget: Budget) => {
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budget),
      });

      if (response.ok) {
        const newBudget = await response.json();
        setBudgets((prev) => [...prev.filter((b) => b.category !== budget.category), newBudget]);
      } else {
        throw new Error('Failed to add budget');
      }
    } catch (error) {
      console.error('Error adding budget:', error);
      throw error;
    }
  };

  const updateBudget = async (category: Category, budget: Budget) => {
    // For now, we'll delete and recreate since we don't have update endpoint
    const existingBudget = budgets.find(b => b.category === category);
    if (existingBudget?.id) {
      await deleteBudget(existingBudget.id);
    }
    await addBudget(budget);
  };

  const deleteBudget = async (id: string) => {
    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBudgets((prev) => prev.filter((b) => b.id !== id));
      } else {
        throw new Error('Failed to delete budget');
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  };

  const filterTransactions = (filters: FilterOptions): Transaction[] => {
    return transactions.filter((transaction) => {
      if (filters.type && transaction.type !== filters.type) return false;
      if (filters.category && transaction.category !== filters.category) return false;
      if (filters.searchTerm && !transaction.description.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }
      if (filters.dateFrom && new Date(transaction.date) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(transaction.date) > new Date(filters.dateTo)) return false;
      return true;
    });
  };

  const getStats = () => {
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: transactions.length,
    };
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        budgets,
        loading,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addBudget,
        updateBudget,
        deleteBudget,
        filterTransactions,
        getStats,
        refreshData,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
