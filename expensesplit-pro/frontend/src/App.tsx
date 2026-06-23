import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { api } from './services/api';
import { useApi } from './hooks/useApi';
import type { User, Group, Expense } from './types';

import Header from './components/Header';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import GroupView from './components/GroupView';
import SettlementView from './components/SettlementView';
import ConnectionStatus from './components/ConnectionStatus';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

type TabType = 'expenses' | 'groups' | 'settlements';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('expenses');
  const [backendReady, setBackendReady] = useState<boolean | null>(null);

  // Fetch data using custom hook
  const { 
    data: users, 
    loading: usersLoading, 
    error: usersError, 
    refetch: refetchUsers 
  } = useApi<User[]>(() => api.getUsers(), []);

  const { 
    data: groups, 
    loading: groupsLoading, 
    error: groupsError, 
    refetch: refetchGroups 
  } = useApi<Group[]>(() => api.getGroups(), []);

  const { 
    data: expenses, 
    loading: expensesLoading, 
    error: expensesError, 
    refetch: refetchExpenses 
  } = useApi<Expense[]>(() => api.getExpenses(), []);

  // Check backend health on mount
  useEffect(() => {
    const checkHealth = async () => {
      const healthy = await api.healthCheck();
      setBackendReady(healthy);
    };
    checkHealth();
  }, []);

  const handleRefresh = () => {
    refetchUsers();
    refetchGroups();
    refetchExpenses();
  };

  const isLoading = usersLoading || groupsLoading || expensesLoading;
  const hasError = usersError || groupsError || expensesError;

  // Loading State
  if (isLoading && !users && !groups && !expenses) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Loading ExpenseSplit Pro</h2>
          <p className="text-sm text-gray-500">Connecting to backend...</p>
        </div>
        <Toaster position="top-right" />
      </div>
    );
  }

  // Error State
  if (hasError && !users && !groups) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-sm text-gray-500 mb-6">
            Cannot connect to the backend API at <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}</code>
          </p>
          <div className="space-y-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <p className="font-medium text-gray-900 mb-2">Troubleshooting:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Ensure the .NET backend is running on port 5000</li>
              <li>Check that CORS is enabled in Program.cs</li>
              <li>Verify SQL Server LocalDB is connected</li>
            </ol>
          </div>
          <button
            onClick={handleRefresh}
            className="w-full py-2.5 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </button>
        </div>
        <Toaster position="top-right" />
      </div>
    );
  }

  const userList = users || [];
  const groupList = groups || [];
  const expenseList = expenses || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as TabType)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Content */}
        <div className="animate-in fade-in duration-300">
          {activeTab === 'expenses' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form */}
              <div className="lg:col-span-1">
                <ExpenseForm 
                  users={userList} 
                  groups={groupList} 
                  onSuccess={handleRefresh}
                />
              </div>

              {/* List */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Expenses</h2>
                  <button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
                <ExpenseList 
                  expenses={expenseList} 
                  loading={expensesLoading} 
                  onRefresh={handleRefresh}
                />
              </div>
            </div>
          )}

          {activeTab === 'groups' && (
            <GroupView 
              groups={groupList} 
              expenses={expenseList}
              loading={groupsLoading}
            />
          )}

          {activeTab === 'settlements' && (
            <SettlementView 
              groups={groupList} 
              expenses={expenseList}
            />
          )}
        </div>
      </main>

      {/* Connection Status Indicator */}
      <ConnectionStatus />

      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#16a34a',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#dc2626',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}
