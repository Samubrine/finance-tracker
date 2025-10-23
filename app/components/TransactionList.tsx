'use client';

import React, { useState } from 'react';
import { Transaction, FilterOptions } from '../types';
import TransactionItem from './TransactionItem';
import TransactionForm from './TransactionForm';
import { useTransactions } from '../context/TransactionContext';

interface TransactionListProps {
  filters: FilterOptions;
}

const TransactionList: React.FC<TransactionListProps> = ({ filters }) => {
  const { filterTransactions } = useTransactions();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const filteredTransactions = filterTransactions(filters);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleCloseEdit = () => {
    setEditingTransaction(null);
  };

  if (filteredTransactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No transactions found</p>
        <p className="text-gray-400 text-sm mt-2">
          {filters.searchTerm || filters.type || filters.category
            ? 'Try adjusting your filters'
            : 'Add your first transaction to get started'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {filteredTransactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            onEdit={handleEdit}
          />
        ))}
      </div>

      {editingTransaction && (
        <TransactionForm
          onClose={handleCloseEdit}
          editTransaction={editingTransaction}
        />
      )}
    </>
  );
};

export default TransactionList;
