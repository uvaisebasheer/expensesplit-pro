import React, { useState, useEffect } from 'react';
import api from './services/api';
import { Expense, User, OptimizationResult } from './types';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import SettlementView from './components/SettlementView';

function App() {
  const [expenses, setExpenses] = useState([] as Expense[]);
  const [users, setUsers] = useState([] as User[]);
  const [optimization, setOptimization] = useState(null as OptimizationResult | null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [expensesRes, usersRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/users')
      ]);
      setExpenses(expensesRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const res = await api.get('/groups/1/optimize');
      setOptimization(res.data);
    } catch (error) {
      console.error('Error optimizing:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white py-6 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">ExpenseSplit Pro</h1>
          <p className="text-blue-100 mt-1">Smart expense splitting with AI-powered optimization</p>
        </div>
      </header>

    <main className="container mx-auto px-2 sm:px-4 py-8 max-w-4xl">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <ExpenseForm 
              users={users} 
              onExpenseCreated={fetchData} 
            />
            <button
              onClick={handleOptimize}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md shadow-md transition flex items-center justify-center gap-2"
            >
              <span>⚡</span>
              Optimize Settlements
            </button>
          </div>
          
          <div className="space-y-6">
            <SettlementView result={optimization} loading={loading} />
            <ExpenseList expenses={expenses} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;