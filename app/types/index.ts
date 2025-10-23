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

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type AlertType = 'budget_warning' | 'goal_milestone' | 'unusual_spending' | 'recurring_reminder';

export type AlertSeverity = 'info' | 'warning' | 'error';

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

export interface RecurringTransaction {
  id?: string;
  type: TransactionType;
  amount: number;
  category: Category;
  description: string;
  frequency: Frequency;
  startDate: string;
  endDate?: string;
  lastRun?: string;
  isActive: boolean;
}

export interface SavingsGoal {
  id?: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category?: string;
  description?: string;
  isCompleted: boolean;
}

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  severity: AlertSeverity;
  isRead: boolean;
  metadata?: string;
  createdAt: string;
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
