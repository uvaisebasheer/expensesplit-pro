import React, { useState, useEffect } from 'react';
import { Plus, X, Calculator, Calendar, Tag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { User, Group, CreateExpenseDto, ExpenseCategory, ExpenseShare } from '../types';
import { EXPENSE_CATEGORIES } from '../types';
import { api } from '../services/api';

interface ExpenseFormProps {
  users: User[];
  groups: Group[];
  onSuccess: () => void;
}

export default function ExpenseForm({ users, groups, onSuccess }: ExpenseFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidById, setPaidById] = useState<number>(0);
  const [groupId, setGroupId] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory>('Food & Dining');
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [customShares, setCustomShares] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);

  // Reset form when groups/users change
  useEffect(() => {
    if (users.length > 0 && paidById === 0) {
      setPaidById(users[0].id);
    }
    if (groups.length > 0 && groupId === 0) {
      setGroupId(groups[0].id);
      // Auto-select all group members
      const group = groups[0];
      if (group.members) {
        setSelectedMembers(group.members.map(m => m.id));
      }
    }
  }, [users, groups]);

  // Update selected members when group changes
  useEffect(() => {
    const group = groups.find(g => g.id === groupId);
    if (group?.members) {
      setSelectedMembers(group.members.map(m => m.id));
    }
  }, [groupId, groups]);

  const handleAmountChange = (value: string) => {
    // Allow only numbers and decimal point
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
    }
  };

  const calculateEqualShares = (): ExpenseShare[] => {
    const num = selectedMembers.length;
    if (num === 0 || !amount) return [];

    const totalAmount = parseFloat(amount);
    const baseShare = Math.floor((totalAmount / num) * 100) / 100;
    const remainder = totalAmount - (baseShare * num);

    return selectedMembers.map((userId, index) => ({
      id: 0,
      userId,
      userName: users.find(u => u.id === userId)?.name || '',
      amount: index === 0 ? baseShare + remainder : baseShare,
    }));
  };

  const getShares = (): ExpenseShare[] => {
    if (splitType === 'equal') {
      return calculateEqualShares();
    }

    return selectedMembers.map(userId => ({
      id: 0,
      userId,
      userName: users.find(u => u.id === userId)?.name || '',
      amount: parseFloat(customShares[userId] || '0') || 0,
    }));
  };

  const getTotalShares = (): number => {
    return getShares().reduce((sum, share) => sum + share.amount, 0);
  };

  const isValid = (): boolean => {
    if (!description.trim() || !amount || parseFloat(amount) <= 0) return false;
    if (paidById === 0 || groupId === 0) return false;
    if (selectedMembers.length === 0) return false;
    if (splitType === 'custom') {
      const total = getTotalShares();
      const target = parseFloat(amount);
      return Math.abs(total - target) < 0.01;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid()) {
      toast.error('Please fill all fields correctly');
      return;
    }

    setLoading(true);
    try {
      const shares = getShares().map(s => ({ userId: s.userId, amount: s.amount }));

      const expense: CreateExpenseDto = {
        description: description.trim(),
        amount: parseFloat(amount),
        paidById,
        groupId,
        date,
        category,
        shares,
      };

      await api.createExpense(expense);
      toast.success('Expense added successfully!');

      // Reset form
      setDescription('');
      setAmount('');
      setCustomShares({});
      setSplitType('equal');
      onSuccess();
    } catch {
      // Error handled by API interceptor
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (userId: number) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const currentGroup = groups.find(g => g.id === groupId);
  const shareTotal = getTotalShares();
  const amountNum = parseFloat(amount) || 0;
  const shareDiff = amountNum - shareTotal;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary-600" />
          Add New Expense
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g., Dinner at Zaitoon"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            required
          />
        </div>

        {/* Amount and Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={e => handleAmountChange(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-4 h-4" />
              Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as ExpenseCategory)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
            >
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Paid By and Group */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Paid By
            </label>
            <select
              value={paidById}
              onChange={e => setPaidById(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
            >
              <option value={0}>Select payer...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Group
            </label>
            <select
              value={groupId}
              onChange={e => setGroupId(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
            >
              <option value={0}>Select group...</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            required
          />
        </div>

        {/* Split Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Split Type
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSplitType('equal')}
              className={`
                flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all
                ${splitType === 'equal'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <Calculator className="w-4 h-4 inline mr-1.5" />
              Equal Split
            </button>
            <button
              type="button"
              onClick={() => setSplitType('custom')}
              className={`
                flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all
                ${splitType === 'custom'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              Custom Split
            </button>
          </div>
        </div>

        {/* Members Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Split Between ({selectedMembers.length} selected)
          </label>
          <div className="flex flex-wrap gap-2">
            {currentGroup?.members?.map(member => (
              <button
                key={member.id}
                type="button"
                onClick={() => toggleMember(member.id)}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium transition-all
                  ${selectedMembers.includes(member.id)
                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                    : 'bg-gray-100 text-gray-500 border-2 border-transparent hover:bg-gray-200'
                  }
                `}
              >
                {member.name}
              </button>
            ))}
            {!currentGroup && (
              <p className="text-sm text-gray-400 italic">Select a group to see members</p>
            )}
          </div>
        </div>

        {/* Custom Shares Input */}
        {splitType === 'custom' && selectedMembers.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Custom Amounts</span>
              <span className={`text-sm font-semibold ${Math.abs(shareDiff) < 0.01 ? 'text-success-600' : 'text-danger-600'}`}>
                Total: ₹{shareTotal.toFixed(2)} / ₹{amountNum.toFixed(2)}
                {Math.abs(shareDiff) > 0.01 && ` (₹${shareDiff.toFixed(2)} ${shareDiff > 0 ? 'remaining' : 'over'})`}
              </span>
            </div>
            {selectedMembers.map(userId => {
              const user = users.find(u => u.id === userId);
              return (
                <div key={userId} className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 w-24 truncate">{user?.name}</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={customShares[userId] || ''}
                      onChange={e => setCustomShares(prev => ({ ...prev, [userId]: e.target.value }))}
                      placeholder="0.00"
                      className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Equal Split Preview */}
        {splitType === 'equal' && amount && selectedMembers.length > 0 && (
          <div className="bg-primary-50 rounded-xl p-4">
            <p className="text-sm font-medium text-primary-800 mb-2">
              Each person pays: ₹{(parseFloat(amount) / selectedMembers.length).toFixed(2)}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedMembers.map(userId => {
                const user = users.find(u => u.id === userId);
                return (
                  <span key={userId} className="inline-flex items-center px-2.5 py-1 rounded-md bg-white text-xs text-primary-700 font-medium border border-primary-200">
                    {user?.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !isValid()}
          className={`
            w-full py-3 px-4 rounded-xl text-white font-semibold text-sm
            transition-all duration-200 flex items-center justify-center gap-2
            ${loading || !isValid()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700 active:scale-[0.98] shadow-lg shadow-primary-200'
            }
          `}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add Expense
            </>
          )}
        </button>
      </form>
    </div>
  );
}
