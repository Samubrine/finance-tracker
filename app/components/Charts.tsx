'use client';

import React, { useMemo } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { Category } from '../types';

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
];

const Charts: React.FC = () => {
  const { transactions } = useTransactions();

  // Expense by Category Data
  const expenseByCategoryData = useMemo(() => {
    const expenseMap = new Map<Category, number>();
    
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const current = expenseMap.get(t.category) || 0;
        expenseMap.set(t.category, current + t.amount);
      });

    return Array.from(expenseMap.entries())
      .map(([category, amount]) => ({
        name: category,
        value: parseFloat(amount.toFixed(2)),
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Transaction Trend Data (Last 30 Days)
  const trendData = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 29);

    const days = eachDayOfInterval({ start: thirtyDaysAgo, end: today });

    return days.map((day) => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayTransactions = transactions.filter((t) => t.date === dayStr);

      const income = dayTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = dayTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        date: format(day, 'MMM dd'),
        income: parseFloat(income.toFixed(2)),
        expense: parseFloat(expense.toFixed(2)),
        net: parseFloat((income - expense).toFixed(2)),
      };
    });
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-500 text-lg">No data to display</p>
        <p className="text-gray-400 text-sm mt-2">Add some transactions to see visualizations</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Expense by Category Pie Chart */}
      {expenseByCategoryData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Expenses by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseByCategoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {expenseByCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Transaction Trend Line Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Transaction Trends (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            <Legend />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#10b981"
              strokeWidth={2}
              name="Income"
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#ef4444"
              strokeWidth={2}
              name="Expense"
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="net"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Net"
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;
