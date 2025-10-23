'use client';

import React from 'react';
import { useTransactions } from '../context/TransactionContext';
import { Wallet, TrendingUp, TrendingDown, Receipt } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { getStats } = useTransactions();
  const stats = getStats();

  const statCards = [
    {
      title: 'Balance',
      value: stats.balance,
      icon: Wallet,
      color: stats.balance >= 0 ? 'blue' : 'red',
      bgColor: stats.balance >= 0 ? 'bg-blue-50' : 'bg-red-50',
      textColor: stats.balance >= 0 ? 'text-blue-600' : 'text-red-600',
      iconColor: stats.balance >= 0 ? 'text-blue-500' : 'text-red-500',
    },
    {
      title: 'Total Income',
      value: stats.totalIncome,
      icon: TrendingUp,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      iconColor: 'text-green-500',
    },
    {
      title: 'Total Expenses',
      value: stats.totalExpense,
      icon: TrendingDown,
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      iconColor: 'text-red-500',
    },
    {
      title: 'Transactions',
      value: stats.transactionCount,
      icon: Receipt,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      iconColor: 'text-purple-500',
      isCount: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => (
        <div
          key={stat.title}
          className={`${stat.bgColor} rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
            <stat.icon className={`${stat.iconColor}`} size={24} />
          </div>
          <p className={`text-3xl font-bold ${stat.textColor}`}>
            {stat.isCount ? stat.value : `$${stat.value.toFixed(2)}`}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
