'use client';

import React from 'react';
import { useTransactions } from '../context/TransactionContext';
import { Download } from 'lucide-react';
import { format } from 'date-fns';

const ExportButton: React.FC = () => {
  const { transactions } = useTransactions();

  const exportToCSV = () => {
    if (transactions.length === 0) {
      alert('No transactions to export');
      return;
    }

    // Create CSV header
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
    
    // Create CSV rows
    const rows = transactions.map((t) => [
      t.date,
      t.type,
      t.category,
      `"${t.description}"`, // Wrap in quotes to handle commas in descriptions
      t.amount.toFixed(2),
    ]);

    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `finance-tracker-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={exportToCSV}
      disabled={transactions.length === 0}
      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      title="Export transactions to CSV"
    >
      <Download size={20} />
      Export CSV
    </button>
  );
};

export default ExportButton;
