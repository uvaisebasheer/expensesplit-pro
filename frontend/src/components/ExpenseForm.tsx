import React, { useState } from 'react';
import api from '../services/api';
import { CreateExpenseDto, ExpenseSplit } from '../types';

interface ExpenseFormProps {
  users: { id: number; name: string }[];
  onExpenseCreated: () => void;
}

function ExpenseForm(props: ExpenseFormProps) {
  const { users, onExpenseCreated } = props;
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidByUserId, setPaidByUserId] = useState(users[0]?.id || 1);
  const [splits, setSplits] = useState(
    users.map(u => ({ userId: u.id, amount: 0 } as ExpenseSplit))
  );

  const handleSplitChange = (userId: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    setSplits(prev => prev.map(s => 
      s.userId === userId ? { ...s, amount: numValue } : s
    ));
  };

  const handleEqualSplit = () => {
    const total = parseFloat(amount) || 0;
    const equalAmount = total / users.length;
    setSplits(users.map(u => ({ 
      userId: u.id, 
      amount: Math.round(equalAmount * 100) / 100 
    } as ExpenseSplit)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dto: CreateExpenseDto = {
      description,
      amount: parseFloat(amount),
      paidByUserId,
      groupId: 1,
      splits
    };

    try {
      await api.post('/expenses', dto);
      setDescription('');
      setAmount('');
      setSplits(users.map(u => ({ userId: u.id, amount: 0 } as ExpenseSplit)));
      onExpenseCreated();
      alert('Expense created successfully!');
    } catch (error) {
      console.error('Error creating expense:', error);
      alert('Failed to create expense');
    }
  };

  const totalSplit = splits.reduce((sum, s) => sum + s.amount, 0);
  const amountNum = parseFloat(amount) || 0;
  const isBalanced = Math.abs(totalSplit - amountNum) < 0.01;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">Add New Expense</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[48px]"
            placeholder="e.g., Dinner, Taxi, Movie"
            required
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Amount (₹)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[48px]"
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
        </div>

        {/* Paid By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paid By
          </label>
          <select
            value={paidByUserId}
            onChange={(e) => setPaidByUserId(Number(e.target.value))}
            className="w-full p-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[48px] bg-white"
          >
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>

        {/* Splits Section */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
            <label className="block text-sm font-medium text-gray-700">
              Splits
            </label>
            <button
              type="button"
              onClick={handleEqualSplit}
              className="w-full sm:w-auto text-sm bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md transition min-h-[40px] touch-manipulation"
            >
              Split Equally
            </button>
          </div>
          
          <div className="space-y-2">
            {users.map(user => {
              const split = splits.find(s => s.userId === user.id);
              return (
                <div key={user.id} className="flex items-center gap-2">
                  <span className="w-20 text-sm flex-shrink-0">{user.name}:</span>
                  <input
                    type="number"
                    value={split?.amount || ''}
                    onChange={(e) => handleSplitChange(user.id, e.target.value)}
                    className="flex-1 p-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[48px]"
                    step="0.01"
                    min="0"
                  />
                </div>
              );
            })}
          </div>
          
          {/* Balance Indicator */}
          <div className={`mt-3 p-2 rounded-md text-sm font-medium ${
            isBalanced ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            <div className="flex justify-between items-center">
              <span>Total Split:</span>
              <span>₹{totalSplit.toFixed(2)} / ₹{amountNum.toFixed(2)}</span>
            </div>
            {!isBalanced && (
              <p className="text-xs mt-1">Does not match total amount</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isBalanced || !description || !amount}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition min-h-[48px] text-base touch-manipulation active:bg-blue-800"
        >
          Create Expense
        </button>
      </form>
    </div>
  );
}

export default ExpenseForm;