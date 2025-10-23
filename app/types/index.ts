export type TransactionType = 'income' | 'expense';

export type Category = 
  | 'Salary'
  | 'Freelance'
  | 'Investment'
  | 'Other Income'
  | 'Food'
  | 'Transportation'
  | 'Entertainment'
  | 'Shopping'
  | 'Bills'
  | 'Healthcare'
  | 'Education'
  | 'Other Expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  description: string;
  date: string;
  createdAt: string;
}

export interface Budget {
  id?: string;
  category: Category;
  limit: number;
  period: 'monthly' | 'weekly';
}

export interface TransactionStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

export interface FilterOptions {
  type?: TransactionType;
  category?: Category;
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
}
