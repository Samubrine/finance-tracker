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
import RecurringTransactions from './components/RecurringTransactions';
import SavingsGoals from './components/SavingsGoals';
import AlertsPanel from './components/AlertsPanel';
import Hero from './components/Hero';
import PageTransition from './components/PageTransition';
import { FilterOptions } from './types';
import { Plus, DollarSign, TrendingUp, LogOut, Repeat, Target, Bell } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [activeTab, setActiveTab] = useState<'transactions' | 'charts' | 'budget' | 'recurring' | 'goals' | 'alerts'>('transactions');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-6 text-gray-700 text-lg font-medium animate-pulse">Loading your finances...</p>
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
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <Hero userName={session?.user?.name || session?.user?.email?.split('@')[0]} isLoggedIn={true} />

        {/* Header */}
        <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-40 animate-slide-down">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-2 shadow-lg">
                  <DollarSign className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Finance Tracker</h1>
                  <p className="text-sm text-gray-600">Welcome, {session?.user?.name || session?.user?.email}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <ExportButton />
                <button
                  onClick={() => setShowAddTransaction(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <Plus size={20} />
                  Add Transaction
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all shadow-sm hover:shadow-md"
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
          <div className="animate-slide-up">
            <Dashboard />
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 border-b border-gray-200 animate-fade-in animate-delay-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-6 py-3 font-medium transition-all border-b-2 transform hover:scale-105 whitespace-nowrap ${
                activeTab === 'transactions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className={`px-6 py-3 font-medium transition-all border-b-2 flex items-center gap-2 transform hover:scale-105 whitespace-nowrap ${
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
              className={`px-6 py-3 font-medium transition-all border-b-2 transform hover:scale-105 whitespace-nowrap ${
                activeTab === 'budget'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Budget
            </button>
            <button
              onClick={() => setActiveTab('recurring')}
              className={`px-6 py-3 font-medium transition-all border-b-2 flex items-center gap-2 transform hover:scale-105 whitespace-nowrap ${
                activeTab === 'recurring'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Repeat size={18} />
              Recurring
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-6 py-3 font-medium transition-all border-b-2 flex items-center gap-2 transform hover:scale-105 whitespace-nowrap ${
                activeTab === 'goals'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Target size={18} />
              Goals
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-6 py-3 font-medium transition-all border-b-2 flex items-center gap-2 transform hover:scale-105 whitespace-nowrap ${
                activeTab === 'alerts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Bell size={18} />
              Alerts
            </button>
          </div>

          {/* Content Based on Active Tab */}
          <div className="animate-fade-in">
            {activeTab === 'transactions' && (
              <div className="space-y-6">
                <div className="animate-slide-in-left">
                  <FilterBar filters={filters} onFiltersChange={setFilters} />
                </div>
                <div className="animate-slide-in-right animate-delay-200">
                  <TransactionList filters={filters} />
                </div>
              </div>
            )}

            {activeTab === 'charts' && (
              <div className="animate-scale-in">
                <Charts />
              </div>
            )}

            {activeTab === 'budget' && (
              <div className="animate-scale-in">
                <BudgetTracker />
              </div>
            )}

            {activeTab === 'recurring' && (
              <div className="animate-scale-in">
                <RecurringTransactions />
              </div>
            )}

            {activeTab === 'goals' && (
              <div className="animate-scale-in">
                <SavingsGoals />
              </div>
            )}

            {activeTab === 'alerts' && (
              <div className="animate-scale-in">
                <AlertsPanel />
              </div>
            )}
          </div>
        </main>

        {/* Add Transaction Modal */}
        {showAddTransaction && (
          <div className="animate-fade-in">
            <TransactionForm onClose={() => setShowAddTransaction(false)} editTransaction={null} />
          </div>
        )}

        {/* Footer */}
        <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white border-t border-gray-700 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <DollarSign className="text-blue-400" size={24} />
                <h3 className="text-xl font-bold">Finance Tracker</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Manage your money with ease and confidence
              </p>
              <p className="text-gray-500 text-xs mt-3">
                © 2025 Finance Tracker. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
