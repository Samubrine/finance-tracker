'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Dashboard from './components/Dashboard';
import FilterBar from './components/FilterBar';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import Charts from './components/Charts';
import ExportButton from './components/ExportButton';
import BudgetTracker from './components/BudgetTracker';
import { FilterOptions } from './types';
import { Plus, DollarSign, TrendingUp, LogOut } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [activeTab, setActiveTab] = useState<'transactions' | 'charts' | 'budget'>('transactions');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 rounded-lg p-2">
                <DollarSign className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Finance Tracker</h1>
                <p className="text-sm text-gray-600">Welcome, {session?.user?.name || session?.user?.email}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <ExportButton />
              <button
                onClick={() => setShowAddTransaction(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                <Plus size={20} />
                Add Transaction
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <Dashboard />

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'transactions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'charts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <TrendingUp size={18} />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('budget')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'budget'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Budget
          </button>
        </div>

        {/* Content Based on Active Tab */}
        {activeTab === 'transactions' && (
          <>
            <FilterBar filters={filters} onFiltersChange={setFilters} />
            <TransactionList filters={filters} />
          </>
        )}

        {activeTab === 'charts' && <Charts />}

        {activeTab === 'budget' && <BudgetTracker />}
      </main>

      {/* Add Transaction Modal */}
      {showAddTransaction && (
        <TransactionForm onClose={() => setShowAddTransaction(false)} editTransaction={null} />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            Finance Tracker - Manage your money with ease
          </p>
        </div>
      </footer>
    </div>
  );
}
